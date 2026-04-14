import { v } from "convex/values";

import { internalMutation } from "@/convex/_generated/server";

/**
 * Seed a newly-created user with a default "Cash" account and a minimal set
 * of starter categories. Called from the Clerk `user.created` webhook.
 * Idempotent: re-deliveries are safe.
 */
export const initializeUser = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const existingAccounts = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);

    if (existingAccounts.length > 0) {
      return { initialized: false };
    }

    const now = Date.now();

    await ctx.db.insert("accounts", {
      userId,
      name: "Cash",
      balance: 0,
      transactionCount: 0,
      updatedAt: now,
    });

    const existingCategories = await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const onlyBalanceCorrection =
      existingCategories.length > 0 &&
      existingCategories.every((cat) =>
        cat.name.trim().toLowerCase().startsWith("balance correction"),
      );

    if (existingCategories.length === 0 || onlyBalanceCorrection) {
      const defaults = [
        { name: "Income", icon: "💰", type: "income" as const },
        { name: "Food", icon: "🍔", type: "expense" as const },
        { name: "Shopping", icon: "🛒", type: "expense" as const },
      ];

      for (const category of defaults) {
        await ctx.db.insert("categories", {
          userId,
          ...category,
          transactionCount: 0,
          transactionAmount: 0,
        });
      }
    }

    return { initialized: true };
  },
});
