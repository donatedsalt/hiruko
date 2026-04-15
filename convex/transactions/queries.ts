import { v } from "convex/values";

import { query } from "@/convex/_generated/server";

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
        .withIndex("by_userId_transactionTime", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }

    return transactions;
  },
});

/**
 * Get all transactions and filtered transactions (income & expense)
 * for the authenticated user in a single query.
 *
 * Performs a single full collect and derives the income/expense slices
 * in-memory to avoid three redundant table scans per dashboard mount.
 */
export const listAllVariants = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const all = await ctx.db
      .query("transactions")
      .withIndex("by_userId_transactionTime", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return {
      all,
      income: all.filter((txn) => txn.type === "income"),
      expense: all.filter((txn) => txn.type === "expense"),
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
