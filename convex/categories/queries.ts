import { v } from "convex/values";

import { query } from "@/convex/_generated/server";

import { getUserId } from "@/convex/utils/auth";

/**
 * Get all categories for the authenticated user.
 */
export const list = query(async (ctx) => {
  const userId = await getUserId(ctx);
  if (!userId) return [];

  return await ctx.db
    .query("categories")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
});

/**
 * Get a single category by ID.
 */
export const getById = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const category = await ctx.db.get(args.id);

    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    return category;
  },
});
