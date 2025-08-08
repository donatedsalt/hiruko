import { mutation } from "../_generated/server";
import { v } from "convex/values";

import { getUserId } from "../utils/auth";
import { adjustAccount } from "../utils/db/accounts";

export const create = mutation({
  args: {
    category: v.string(),
    accountId: v.id("accounts"),
    type: v.union(v.literal("income"), v.literal("expense")),
    amount: v.number(),
    title: v.optional(v.string()),
    note: v.optional(v.string()),
    transactionTime: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const account = await ctx.db.get(args.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Invalid account");
    }

    const transaction = await ctx.db.insert("transactions", {
      userId,
      category: args.category,
      accountId: args.accountId,
      type: args.type,
      amount: args.amount,
      title: args.title,
      note: args.note,
      transactionTime: args.transactionTime,
      updatedAt: Date.now(),
    });

    const balanceDelta = args.type === "income" ? args.amount : -args.amount;

    await ctx.db.patch(args.accountId, {
      balance: account.balance + balanceDelta,
      transactionsCount: (account.transactionsCount ?? 0) + 1,
    });

    return transaction;
  },
});

export const update = mutation({
  args: {
    id: v.id("transactions"),
    updates: v.object({
      category: v.optional(v.string()),
      accountId: v.optional(v.id("accounts")),
      amount: v.optional(v.number()),
      type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
      title: v.optional(v.string()),
      note: v.optional(v.string()),
      transactionTime: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const transaction = await ctx.db.get(id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const originalAccount = await ctx.db.get(transaction.accountId);
    if (!originalAccount || originalAccount.userId !== userId) {
      throw new Error("Original account not found");
    }

    const newAccountId = updates.accountId ?? transaction.accountId;
    const newAccount = await ctx.db.get(newAccountId);
    if (!newAccount || newAccount.userId !== userId) {
      throw new Error("Target account not found");
    }

    const oldAmount = transaction.amount;
    const newAmount = updates.amount ?? oldAmount;

    const oldType = transaction.type;
    const newType = updates.type ?? oldType;

    const accountChanged = transaction.accountId !== newAccountId;
    const amountChanged = newAmount !== oldAmount;
    const typeChanged = oldType !== newType;

    if (accountChanged || amountChanged || typeChanged) {
      await adjustAccount(
        ctx,
        originalAccount,
        transaction.amount,
        oldType,
        -1
      );
      await adjustAccount(ctx, newAccount, newAmount, newType, 1);
    }

    await ctx.db.patch(id, {
      ...updates,
      accountId: newAccountId,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, { id }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const transaction = await ctx.db.get(id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const account = await ctx.db.get(transaction.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    const balanceDelta =
      transaction.type === "income" ? -transaction.amount : transaction.amount;

    await ctx.db.patch(transaction.accountId, {
      balance: account.balance + balanceDelta,
      transactionsCount: Math.max((account.transactionsCount ?? 1) - 1, 0),
    });

    await ctx.db.delete(id);

    return id;
  },
});
