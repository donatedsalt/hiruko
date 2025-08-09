import { query } from "../_generated/server";
import { v } from "convex/values";

import { getUserId } from "../utils/auth";
import { getUserTransactions } from "../utils/db/transactions";

/**
 * Get all transactions for the authenticated user.
 */
export const list = query({
  args: {
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
  },
  handler: async (ctx, args) => {
    let transactions = await getUserTransactions(ctx);

    if (args.type) {
      transactions = transactions.filter((t) => t.type === args.type);
    }

    return transactions.sort((a, b) => b.transactionTime - a.transactionTime);
  },
});

/**
 * Get all transactions and filtered transactions (income & expense) for the authenticated user.
 */
export const listAllVariants = query({
  args: {},
  handler: async (ctx) => {
    const transactions = await getUserTransactions(ctx);

    return {
      all: transactions,
      income: transactions.filter((t) => t.type === "income"),
      expense: transactions.filter((t) => t.type === "expense"),
    };
  },
});

export const getTransactionById = query({
/**
 * Get a single transaction by ID.
 */
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Not found");
    }

    return transaction;
  },
});

/**
 * Get all transactions grouped by date for the authenticated user.
 */
export const groupByDate = query({
  args: {},
  handler: async (ctx) => {
    const transactions = await getUserTransactions(ctx);

    transactions.sort((a, b) => b.transactionTime - a.transactionTime);

    const grouped = transactions.reduce(
      (acc, txn) => {
        const dateKey = new Date(txn.transactionTime)
          .toISOString()
          .split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(txn);
        return acc;
      },
      {} as Record<string, typeof transactions>
    );

    return grouped;
  },
});

/**
 * Get all transactions grouped by month for the authenticated user.
 */
export const groupByMonth = query({
  args: {},
  handler: async (ctx) => {
    const transactions = await getUserTransactions(ctx);

    const grouped = transactions.reduce(
      (acc, txn) => {
        const date = new Date(txn.transactionTime);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(txn);
        return acc;
      },
      {} as Record<string, typeof transactions>
    );

    return grouped;
  },
});

/**
 * Get all transactions grouped by category for the authenticated user.
 */
export const groupByCategory = query({
  args: {},
  handler: async (ctx) => {
    const transactions = await getUserTransactions(ctx);

    transactions.sort((a, b) => b.transactionTime - a.transactionTime);

    const grouped = transactions.reduce(
      (acc, txn) => {
        const key = txn.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push(txn);
        return acc;
      },
      {} as Record<string, typeof transactions>
    );

    return grouped;
  },
});
