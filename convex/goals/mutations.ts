import { v } from "convex/values";

import { mutation } from "@/convex/_generated/server";

import { getUserId } from "@/convex/utils/auth";

export const createGoal = mutation({
  args: {
    name: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, { name, amount }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    return await ctx.db.insert("goals", {
      userId,
      name,
      amount,
      saved: 0,
      transactionCount: 0,
    });
  },
});

/**
 * Update an goal.
 */
export const update = mutation({
  args: {
    id: v.id("goals"),
    name: v.optional(v.string()),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== userId) {
      throw new Error("Goal not found or unauthorized");
    }

    const updates: Partial<typeof goal> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.amount !== undefined) updates.amount = args.amount;

    await ctx.db.patch(args.id, updates);
    return await ctx.db.get(args.id);
  },
});

/**
 * Delete an goal and remove goalId from all associated transactions.
 */
export const remove = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return { success: false, reason: "unauthorized" };

    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== userId) {
      return { success: false, reason: "not_found_or_unauthorized" };
    }

    const txns = await ctx.db
      .query("transactions")
      .withIndex("by_goal", (q) => q.eq("goalId", args.id))
      .collect();

    for (const txn of txns) {
      await ctx.db.patch(txn._id, { goalId: undefined });
    }

    await ctx.db.delete(args.id);

    return {
      success: true,
      deletedGoal: args.id,
      transactionsUpdated: txns.length,
    };
  },
});
