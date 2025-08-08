import { query } from "../_generated/server";
import { v } from "convex/values";

import { getUserId } from "../utils/auth";

/**
 * Get all accounts for the authenticated user.
 */
export const list = query(async (ctx) => {
  const userId = await getUserId(ctx);
  if (!userId) return [];

  return await ctx.db
    .query("accounts")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
});

/**
 * Get a single account by ID.
 */
export const getById = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const account = await ctx.db.get(args.id);

    if (!account || account.userId !== userId) {
      throw new Error("Account not found or unauthorized");
    }

    return account;
  },
});
