import { v } from "convex/values";

import { mutation } from "@/convex/_generated/server";

import { getUserId } from "@/convex/utils/auth";

/**
 * Create a new category.
 */
export const create = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    return await ctx.db.insert("categories", {
      userId,
      name: args.name,
      icon: args.icon,
      color: args.color,
    });
  },
});

/**
 * Create default categories only if user has no categories.
 */
export const createDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existingCount = await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (existingCount.length > 0) {
      return { success: false, message: "Categories already exist" };
    }

    const defaultCategories = [
      { name: "Income", icon: "💰", color: "#16a34a" },
      { name: "Food", icon: "🍔", color: "#ef4444" },
      { name: "Shopping", icon: "🛒", color: "#f97316" },
    ];

    for (const category of defaultCategories) {
      await ctx.db.insert("categories", {
        userId,
        ...category,
      });
    }

    return { success: true };
  },
});

/**
 * Update an category.
 */
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    const updates: Partial<typeof category> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.color !== undefined) updates.color = args.color;

    await ctx.db.patch(args.id, updates);

    return await ctx.db.get(args.id);
  },
});

/**
 * Delete a category and all associated transactions.
 */
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    const txns = await ctx.db
      .query("transactions")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();

    for (const txn of txns) {
      await ctx.db.delete(txn._id);
    }

    await ctx.db.delete(args.id);

    return {
      success: true,
      deletedCategory: args.id,
      transactionsDeleted: txns.length,
    };
  },
});
