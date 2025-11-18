import { v } from "convex/values";

import { mutation } from "@/convex/_generated/server";

import { CategoryId } from "@/types/convex";

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

    const now = Date.now();

    let categoryId: CategoryId | undefined;

    if (args.balance !== 0) {
      const type = args.balance > 0 ? "income" : "expense";
      const absBalance = Math.abs(args.balance);

      const categoryName =
        type === "income"
          ? "Balance Correction (Income)"
          : "Balance Correction (Expense)";

      const category = await ctx.db
        .query("categories")
        .withIndex("by_userId_name", (q) =>
          q.eq("userId", userId).eq("name", categoryName),
        )
        .unique();

      if (!category) {
        categoryId = await ctx.db.insert("categories", {
          userId,
          name: categoryName,
          icon: "⚖️",
          transactionCount: 1,
          transactionAmount: absBalance,
          type,
        });
      } else {
        categoryId = category._id;
        await ctx.db.patch(category._id, {
          transactionCount: (category.transactionCount || 0) + 1,
          transactionAmount: (category.transactionAmount || 0) + absBalance,
        });
      }
    }

    const accountId = await ctx.db.insert("accounts", {
      userId,
      name: args.name,
      balance: args.balance,
      transactionCount: 0,
      updatedAt: now,
    });

    if (args.balance !== 0 && categoryId) {
      const type = args.balance > 0 ? "income" : "expense";
      await Promise.all([
        ctx.db.insert("transactions", {
          userId,
          accountId,
          amount: Math.abs(args.balance),
          type,
          categoryId,
          note: "Initial balance",
          transactionTime: now,
          updatedAt: now,
        }),
        ctx.db.patch(accountId, { transactionCount: 1 }),
      ]);
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
      const now = Date.now();
      const absDiff = Math.abs(difference);

      const categoryName =
        type === "income"
          ? "Balance Correction (Income)"
          : "Balance Correction (Expense)";

      const category = await ctx.db
        .query("categories")
        .withIndex("by_userId_name", (q) =>
          q.eq("userId", userId).eq("name", categoryName),
        )
        .unique();

      let categoryId: CategoryId | undefined;
      if (!category) {
        categoryId = await ctx.db.insert("categories", {
          userId,
          name: categoryName,
          icon: "⚖️",
          type,
          transactionCount: 1,
          transactionAmount: absDiff,
        });
      } else {
        categoryId = category._id;
        await ctx.db.patch(category._id, {
          transactionCount: category.transactionCount + 1,
          transactionAmount: category.transactionAmount + absDiff,
        });
      }

      await ctx.db.insert("transactions", {
        userId,
        accountId: args.id,
        type,
        amount: absDiff,
        categoryId,
        note: "Balance manually adjusted",
        transactionTime: now,
        updatedAt: now,
      });

      updates.balance = args.balance;
      updates.transactionCount = account.transactionCount + 1;
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
