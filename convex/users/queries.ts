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
