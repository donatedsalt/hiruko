import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import { getUserId } from "@/convex/utils/auth";

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
    });
  },
});
