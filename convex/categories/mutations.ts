import { v } from "convex/values";

import { mutation } from "@/convex/_generated/server";

import { requireUserId } from "@/convex/utils/auth";

/**
 * Create a new category.
 */
export const create = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    return await ctx.db.insert("categories", {
      userId,
      name: args.name,
      icon: args.icon,
      type: args.type,
      transactionCount: 0,
      transactionAmount: 0,
    });
  },
});

/**
 * Create default categories only if user has no categories
 * or only Balance Correction categories exist.
 */
export const createDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const existingCategories = await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const hasOnlyBalanceCorrection =
      existingCategories.length <= 2 &&
      existingCategories.every((cat) =>
        cat.name.trim().toLowerCase().startsWith("balance correction"),
      );

    if (existingCategories.length > 0 && !hasOnlyBalanceCorrection) {
      return { success: false, message: "Categories already exist" };
    }

    const defaultCategories = [
      { name: "Income", icon: "💰", type: "income" as const },
      { name: "Food", icon: "🍔", type: "expense" as const },
      { name: "Shopping", icon: "🛒", type: "expense" as const },
    ];

    for (const category of defaultCategories) {
      await ctx.db.insert("categories", {
        userId,
        ...category,
        transactionCount: 0,
        transactionAmount: 0,
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
    type: v.union(v.literal("income"), v.literal("expense")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    const updates: Partial<typeof category> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.type !== undefined) updates.type = args.type;

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
    const userId = await requireUserId(ctx);

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
