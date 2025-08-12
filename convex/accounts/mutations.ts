import { v } from "convex/values";

import { mutation } from "@/convex/_generated/server";

import { getUserId } from "@/convex/utils/auth";

/**
 * Create a new account.
 */
export const create = mutation({
  args: {
    name: v.string(),
    balance: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const accountId = await ctx.db.insert("accounts", {
      userId,
      name: args.name,
      balance: args.balance,
      transactionsCount: 0,
      updatedAt: Date.now(),
    });

    if (args.balance !== 0) {
      await ctx.db.insert("transactions", {
        userId,
        accountId,
        amount: Math.abs(args.balance),
        type: args.balance > 0 ? "income" : "expense",
        category: "balance correction",
        note: "Initial balance",
        transactionTime: Date.now(),
        updatedAt: Date.now(),
      });

      await ctx.db.patch(accountId, { transactionsCount: 1 });
    }

    return accountId;
  },
});

/**
 * Update an account.
 */
export const update = mutation({
  args: {
    id: v.id("accounts"),
    name: v.optional(v.string()),
    balance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found or unauthorized");
    }

    const updates: Partial<typeof account> = {};
    if (args.name !== undefined) updates.name = args.name;

    if (
      args.balance !== undefined &&
      typeof account.balance === "number" &&
      args.balance !== account.balance
    ) {
      const difference = args.balance - account.balance;
      const type = difference > 0 ? "income" : "expense";

      await ctx.db.insert("transactions", {
        userId: userId,
        accountId: args.id,
        type,
        amount: Math.abs(difference),
        category: "balance correction",
        note: "Balance manually adjusted",
        transactionTime: Date.now(),
        updatedAt: Date.now(),
      });

      updates.balance = args.balance;
      updates.transactionsCount = (account.transactionsCount || 0) + 1;
    }

    await ctx.db.patch(args.id, updates);

    return await ctx.db.get(args.id);
  },
});

/**
 * Delete an account and all associated transactions.
 */
export const remove = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found or unauthorized");
    }

    const txns = await ctx.db
      .query("transactions")
      .withIndex("by_account", (q) => q.eq("accountId", args.id))
      .collect();

    for (const txn of txns) {
      await ctx.db.delete(txn._id);
    }

    await ctx.db.delete(args.id);

    return {
      success: true,
      deletedAccount: args.id,
      transactionsDeleted: txns.length,
    };
  },
});
