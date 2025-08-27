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
