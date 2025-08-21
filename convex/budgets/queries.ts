import { query } from "@/convex/_generated/server";
import { getUserId } from "@/convex/utils/auth";

/**
 * Get all budgets for the authenticated user.
 */
export const list = query(async (ctx) => {
  const userId = await getUserId(ctx);
  if (!userId) return [];

  return await ctx.db
    .query("budgets")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
});

/**
 * Get all budgets with progress for the authenticated user.
 */
export const getBudgetsWithProgress = query(async (ctx) => {
  const userId = await getUserId(ctx);
  if (!userId) return [];

  const budgets = await ctx.db
    .query("budgets")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  const txns = await ctx.db
    .query("transactions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  // Group spend by budget
  const spendMap: Record<string, number> = {};
  for (const txn of txns) {
    if (!txn.budgetId) continue;
    spendMap[txn.budgetId] = (spendMap[txn.budgetId] ?? 0) + txn.amount;
  }

  return budgets.map((b) => {
    const spent = Math.abs(spendMap[b._id] ?? 0);
    return {
      ...b,
      spent,
      remaining: b.amount - spent,
      percent: Math.min(100, (spent / b.amount) * 100),
    };
  });
});
