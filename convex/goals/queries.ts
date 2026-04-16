import { query } from "@/convex/_generated/server";
import { requireUserId } from "@/convex/utils/auth";

/**
 * Get all goals for the authenticated user.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    return await ctx.db
      .query("goals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(10_000);
  },
});
