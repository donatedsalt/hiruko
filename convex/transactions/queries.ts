import { v } from "convex/values";

import { query } from "@/convex/_generated/server";

import { TransactionGroups } from "@/types/convex";

import { requireUserId } from "@/convex/utils/auth";

/**
 * Get all transactions for the authenticated user.
 */
export const list = query({
  args: {
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    let transactions;

    if (args.type) {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("by_userId_type", (q) =>
          q.eq("userId", userId).eq("type", args.type!),
        )
        .order("desc")
        .collect();
    } else {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }

    // return transactions.sort((a, b) => b.transactionTime - a.transactionTime);
    return transactions;
  },
});

/**
 * Get all transactions and filtered transactions (income & expense)
 * for the authenticated user in a single query.
 */
export const listAllVariants = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    return {
      all: await ctx.db
        .query("transactions")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .collect(),
      income: await ctx.db
        .query("transactions")
        .withIndex("by_userId_type", (q) =>
          q.eq("userId", userId).eq("type", "income"),
        )
        .order("desc")
        .collect(),
      expense: await ctx.db
        .query("transactions")
        .withIndex("by_userId_type", (q) =>
          q.eq("userId", userId).eq("type", "expense"),
        )
        .order("desc")
        .collect(),
    };
  },
});

/**
 * Get a single transaction by ID for the authenticated user.
 */
export const getById = query({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) {
      return null;
    }

    return transaction;
  },
});

/**
 * Get all transactions grouped by date (YYYY-MM-DD) for the authenticated user.
 */
export const groupByDate = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    transactions.sort((a, b) => b.transactionTime - a.transactionTime);

    const grouped = transactions.reduce((acc, txn) => {
      const dateKey = new Date(txn.transactionTime).toISOString().split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(txn);
      return acc;
    }, {} as TransactionGroups);

    return grouped;
  },
});

/**
 * Get all transactions grouped by month (YYYY-MM) for the authenticated user.
 */
export const groupByMonth = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const grouped = transactions.reduce((acc, txn) => {
      const date = new Date(txn.transactionTime);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(txn);
      return acc;
    }, {} as TransactionGroups);

    return grouped;
  },
});

/**
 * Get all transactions grouped by category for the authenticated user.
 */
export const groupByCategory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    transactions.sort((a, b) => b.transactionTime - a.transactionTime);

    const grouped = transactions.reduce((acc, txn) => {
      const key = txn.categoryId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(txn);
      return acc;
    }, {} as TransactionGroups);

    return grouped;
  },
});
