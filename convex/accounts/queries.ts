import { v } from "convex/values";

import { query } from "@/convex/_generated/server";

import { requireUserId } from "@/convex/utils/auth";

/**
 * Get all accounts for the authenticated user.
 */
export const list = query(async (ctx) => {
  const userId = await requireUserId(ctx);

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
    const userId = await requireUserId(ctx);

    const account = await ctx.db.get(args.id);

    if (!account || account.userId !== userId) {
      throw new Error("Account not found or unauthorized");
    }

    return account;
  },
});
