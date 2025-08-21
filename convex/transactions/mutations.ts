import { v } from "convex/values";

import { mutation } from "@/convex/_generated/server";

import { getUserId } from "@/convex/utils/auth";
import { adjustAccount } from "@/convex/utils/db/accounts";

/**
 * Create a new transaction.
 */
export const create = mutation({
  args: {
    categoryId: v.id("categories"),
    accountId: v.id("accounts"),
    budgetId: v.optional(v.id("budgets")),
    type: v.union(v.literal("income"), v.literal("expense")),
    amount: v.number(),
    title: v.optional(v.string()),
    note: v.optional(v.string()),
    transactionTime: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const account = await ctx.db.get(args.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Invalid account");
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Invalid category");
    }

    if (category.type !== args.type) {
      throw new Error("Category type and transaction type must match");
    }

    const transaction = await ctx.db.insert("transactions", {
      userId,
      categoryId: args.categoryId,
      accountId: args.accountId,
      budgetId: args.budgetId ?? undefined,
      type: args.type,
      amount: args.amount,
      title: args.title,
      note: args.note,
      transactionTime: args.transactionTime,
      updatedAt: Date.now(),
    });

    const balanceDelta = args.type === "income" ? args.amount : -args.amount;

    await ctx.db.patch(args.accountId, {
      balance: account.balance + balanceDelta,
      transactionCount: account.transactionCount + 1,
    });

    await ctx.db.patch(args.categoryId, {
      transactionCount: category.transactionCount + 1,
      transactionAmount: category.transactionAmount + args.amount,
    });

    // update budget if linked + expense
    if (args.budgetId && args.type === "expense") {
      const budget = await ctx.db.get(args.budgetId);
      if (budget && budget.userId === userId) {
        await ctx.db.patch(args.budgetId, {
          spent: (budget.spent ?? 0) + args.amount,
        });
      }
    }

    return transaction;
  },
});

/**
 * Update a transaction.
 */
export const update = mutation({
  args: {
    id: v.id("transactions"),
    updates: v.object({
      categoryId: v.optional(v.id("categories")),
      accountId: v.optional(v.id("accounts")),
      budgetId: v.optional(v.id("budgets")),
      amount: v.optional(v.number()),
      type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
      title: v.optional(v.string()),
      note: v.optional(v.string()),
      transactionTime: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const transaction = await ctx.db.get(id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const originalAccount = await ctx.db.get(transaction.accountId);
    if (!originalAccount || originalAccount.userId !== userId) {
      throw new Error("Original account not found");
    }

    const originalCategory = await ctx.db.get(transaction.categoryId);
    if (!originalCategory || originalCategory.userId !== userId) {
      throw new Error("Original category not found");
    }

    const newAccountId = updates.accountId ?? transaction.accountId;
    const newAccount = await ctx.db.get(newAccountId);
    if (!newAccount || newAccount.userId !== userId) {
      throw new Error("Target account not found");
    }

    const newCategoryId = updates.categoryId ?? transaction.categoryId;
    const newCategory = await ctx.db.get(newCategoryId);
    if (!newCategory || newCategory.userId !== userId) {
      throw new Error("Target category not found");
    }

    const newType = updates.type ?? transaction.type;
    if (newCategory.type !== newType) {
      throw new Error("Category type and transaction type must match");
    }

    const oldAmount = transaction.amount;
    const newAmount = updates.amount ?? oldAmount;

    const oldType = transaction.type;

    const accountChanged = transaction.accountId !== newAccountId;
    const categoryChanged = transaction.categoryId !== newCategoryId;
    const amountChanged = newAmount !== oldAmount;
    const typeChanged = oldType !== newType;

    const oldBudgetId = transaction.budgetId;
    const newBudgetId = updates.budgetId ?? transaction.budgetId;

    if (accountChanged || amountChanged || typeChanged) {
      await adjustAccount(ctx, originalAccount, oldAmount, oldType, -1);
      await adjustAccount(ctx, newAccount, newAmount, newType, 1);
    }

    if (categoryChanged || amountChanged || typeChanged) {
      await ctx.db.patch(originalCategory._id, {
        transactionCount: originalCategory.transactionCount - 1,
        transactionAmount:
          originalCategory.transactionAmount - transaction.amount,
      });

      await ctx.db.patch(newCategory._id, {
        transactionCount: newCategory.transactionCount + 1,
        transactionAmount: newCategory.transactionAmount + newAmount,
      });
    }

    if (
      (amountChanged || typeChanged || oldBudgetId !== newBudgetId) &&
      oldBudgetId &&
      oldType === "expense"
    ) {
      const oldBudget = await ctx.db.get(oldBudgetId);
      if (oldBudget && oldBudget.userId === userId) {
        await ctx.db.patch(oldBudgetId, {
          spent: Math.max((oldBudget.spent ?? 0) - oldAmount, 0),
        });
      }
    }

    if (
      (amountChanged || typeChanged || oldBudgetId !== newBudgetId) &&
      newBudgetId &&
      newType === "expense"
    ) {
      const newBudget = await ctx.db.get(newBudgetId);
      if (newBudget && newBudget.userId === userId) {
        await ctx.db.patch(newBudgetId, {
          spent: (newBudget.spent ?? 0) + newAmount,
        });
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      accountId: newAccountId,
      categoryId: newCategoryId,
      budgetId: newBudgetId,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Delete a transaction.
 */
export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, { id }) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const transaction = await ctx.db.get(id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const account = await ctx.db.get(transaction.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    const balanceDelta =
      transaction.type === "income" ? -transaction.amount : transaction.amount;

    await ctx.db.patch(transaction.accountId, {
      balance: account.balance + balanceDelta,
      transactionCount: Math.max(account.transactionCount - 1, 0),
    });

    const category = await ctx.db.get(transaction.categoryId);
    if (category && category.userId === userId) {
      await ctx.db.patch(transaction.categoryId, {
        transactionCount: Math.max(category.transactionCount - 1, 0),
        transactionAmount: Math.max(
          category.transactionAmount - transaction.amount,
          0
        ),
      });
    }

    if (transaction.budgetId && transaction.type === "expense") {
      const budget = await ctx.db.get(transaction.budgetId);
      if (budget && budget.userId === userId) {
        await ctx.db.patch(transaction.budgetId, {
          spent: Math.max((budget.spent ?? 0) - transaction.amount, 0),
        });
      }
    }

    await ctx.db.delete(id);

    return id;
  },
});
