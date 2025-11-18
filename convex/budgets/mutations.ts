import { v } from "convex/values";

import { mutation } from "@/convex/_generated/server";

import { getUserId } from "@/convex/utils/auth";

/**
 * Create a budget.
 */
export const createBudget = mutation({
  args: {
    name: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, { name, amount }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    return await ctx.db.insert("budgets", {
      userId,
      name,
      amount,
      spent: 0,
      transactionCount: 0,
    });
  },
});

/**
 * Update a budget.
 */
export const update = mutation({
  args: {
    id: v.id("budgets"),
    name: v.optional(v.string()),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const budget = await ctx.db.get(args.id);
    if (!budget || budget.userId !== userId) {
      throw new Error("Budget not found or unauthorized");
    }

    const updates: Partial<typeof budget> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.amount !== undefined) updates.amount = args.amount;

    await ctx.db.patch(args.id, updates);
    return await ctx.db.get(args.id);
  },
});

/**
 * Delete a budget and remove budgetId from all associated transactions.
 */
export const remove = mutation({
  args: { id: v.id("budgets") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return { success: false, reason: "unauthorized" };

    const budget = await ctx.db.get(args.id);
    if (!budget || budget.userId !== userId) {
      return { success: false, reason: "not_found_or_unauthorized" };
    }

    const txns = await ctx.db
      .query("transactions")
      .withIndex("by_budget", (q) => q.eq("budgetId", args.id))
      .collect();

    for (const txn of txns) {
      await ctx.db.patch(txn._id, { budgetId: undefined });
    }

    await ctx.db.delete(args.id);

    return {
      success: true,
      deletedBudget: args.id,
      transactionsUpdated: txns.length,
    };
  },
});
