import { v } from "convex/values";

import { query } from "@/convex/_generated/server";

import { requireUserId } from "@/convex/utils/auth";

/**
 * Bundle of list queries needed to render transaction form selectors
 * (create + edit). Returns accounts, categories, budgets, goals in a
 * single RPC so pages don't fire four independent subscriptions.
 */
export const formDefaults = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const [accounts, categories, budgets, goals] = await Promise.all([
      ctx.db
        .query("accounts")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(10_000),
      ctx.db
        .query("categories")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(10_000),
      ctx.db
        .query("budgets")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(10_000),
      ctx.db
        .query("goals")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(10_000),
    ]);

    return { accounts, categories, budgets, goals };
  },
});

/**
 * Bundle for the dashboard home: accounts (for <AccountsCards/>),
 * categories (for the recent-transactions list), and the recent slice.
 * Saves two subscriptions on every dashboard mount.
 */
export const homeDefaults = query({
  args: { recentLimit: v.number() },
  handler: async (ctx, { recentLimit }) => {
    const userId = await requireUserId(ctx);
    const cap = recentLimit + 1;

    const [accounts, categories, all, income, expense] = await Promise.all([
      ctx.db
        .query("accounts")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(10_000),
      ctx.db
        .query("categories")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(10_000),
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
      accounts,
      categories,
      recent: {
        all: all.slice(0, recentLimit),
        income: income.slice(0, recentLimit),
        expense: expense.slice(0, recentLimit),
        hasMoreAll: all.length > recentLimit,
        hasMoreIncome: income.length > recentLimit,
        hasMoreExpense: expense.length > recentLimit,
      },
    };
  },
});
