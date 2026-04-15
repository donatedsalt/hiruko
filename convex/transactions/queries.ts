import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

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
 * Recent transactions for the dashboard: one .take per tab, each capped at
 * `limit + 1` so the client can tell whether a "View More" link is needed.
 */
export const listRecent = query({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    const userId = await requireUserId(ctx);
    const cap = limit + 1;

    const [all, income, expense] = await Promise.all([
      ctx.db
        .query("transactions")
        .withIndex("by_userId_transactionTime", (q) => q.eq("userId", userId))
        .order("desc")
        .take(cap),
      ctx.db
        .query("transactions")
        .withIndex("by_userId_type", (q) =>
          q.eq("userId", userId).eq("type", "income"),
        )
        .order("desc")
        .take(cap),
      ctx.db
        .query("transactions")
        .withIndex("by_userId_type", (q) =>
          q.eq("userId", userId).eq("type", "expense"),
        )
        .order("desc")
        .take(cap),
    ]);

    return {
      all: all.slice(0, limit),
      income: income.slice(0, limit),
      expense: expense.slice(0, limit),
      hasMoreAll: all.length > limit,
      hasMoreIncome: income.length > limit,
      hasMoreExpense: expense.length > limit,
    };
  },
});

/**
 * Daily income/expense buckets since `sinceMs` with a running balance that
 * starts at 0 at the first visible day. Chart-ready; scoped read.
 */
export const statsByDay = query({
  args: { sinceMs: v.number() },
  handler: async (ctx, { sinceMs }) => {
    const userId = await requireUserId(ctx);

    const txns = await ctx.db
      .query("transactions")
      .withIndex("by_userId_transactionTime", (q) =>
        q.eq("userId", userId).gte("transactionTime", sinceMs),
      )
      .collect();

    const grouped = new Map<string, { income: number; expense: number }>();
    for (const t of txns) {
      const date = new Date(t.transactionTime).toISOString().split("T")[0];
      const bucket = grouped.get(date) ?? { income: 0, expense: 0 };
      if (t.type === "income") bucket.income += t.amount;
      else bucket.expense += t.amount;
      grouped.set(date, bucket);
    }

    const sorted = [...grouped.entries()]
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let balance = 0;
    return sorted.map((d) => {
      balance += d.income - d.expense;
      return { ...d, balance };
    });
  },
});

/**
 * Paginated list of transactions, newest first. Optionally filter by type.
 */
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
  },
  handler: async (ctx, { paginationOpts, type }) => {
    const userId = await requireUserId(ctx);

    const q = type
      ? ctx.db
          .query("transactions")
          .withIndex("by_userId_type", (qb) =>
            qb.eq("userId", userId).eq("type", type),
          )
      : ctx.db
          .query("transactions")
          .withIndex("by_userId_transactionTime", (qb) =>
            qb.eq("userId", userId),
          );

    return await q.order("desc").paginate(paginationOpts);
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
