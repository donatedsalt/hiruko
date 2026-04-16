import { v } from "convex/values";

import { mutation } from "@/convex/_generated/server";

import { requireUserId } from "@/convex/utils/auth";
import { adjustAccount } from "@/convex/utils/db/accounts";

/**
 * Create a new transaction.
 */
export const create = mutation({
  args: {
    categoryId: v.id("categories"),
    accountId: v.id("accounts"),
    budgetId: v.optional(v.union(v.id("budgets"), v.null())),
    goalId: v.optional(v.union(v.id("goals"), v.null())),
    type: v.union(v.literal("income"), v.literal("expense")),
    amount: v.number(),
    title: v.optional(v.string()),
    note: v.optional(v.string()),
    transactionTime: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const [account, category] = await Promise.all([
      ctx.db.get(args.accountId),
      ctx.db.get(args.categoryId),
    ]);
    if (!account || account.userId !== userId) {
      throw new Error("Invalid account");
    }

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
      goalId: args.goalId ?? undefined,
      type: args.type,
      amount: args.amount,
      title: args.title,
      note: args.note,
      transactionTime: args.transactionTime,
      updatedAt: Date.now(),
    });

    const balanceDelta = args.type === "income" ? args.amount : -args.amount;

    const [budget, goal] = await Promise.all([
      args.budgetId && args.type === "expense"
        ? ctx.db.get(args.budgetId)
        : Promise.resolve(null),
      args.goalId && args.type === "expense"
        ? ctx.db.get(args.goalId)
        : Promise.resolve(null),
    ]);

    const patches: Promise<unknown>[] = [
      ctx.db.patch(args.accountId, {
        balance: account.balance + balanceDelta,
        transactionCount: account.transactionCount + 1,
      }),
      ctx.db.patch(args.categoryId, {
        transactionCount: category.transactionCount + 1,
        transactionAmount: category.transactionAmount + args.amount,
      }),
    ];

    if (args.budgetId && budget && budget.userId === userId) {
      patches.push(
        ctx.db.patch(args.budgetId, {
          transactionCount: budget.transactionCount + 1,
          spent: (budget.spent ?? 0) + args.amount,
        }),
      );
    }

    if (args.goalId && goal && goal.userId === userId) {
      patches.push(
        ctx.db.patch(args.goalId, {
          transactionCount: goal.transactionCount + 1,
          saved: (goal.saved ?? 0) + args.amount,
        }),
      );
    }

    await Promise.all(patches);

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
      budgetId: v.optional(v.union(v.id("budgets"), v.null())),
      goalId: v.optional(v.union(v.id("goals"), v.null())),
      amount: v.optional(v.number()),
      type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
      title: v.optional(v.string()),
      note: v.optional(v.string()),
      transactionTime: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const userId = await requireUserId(ctx);

    const transaction = await ctx.db.get(id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const newAccountId = updates.accountId ?? transaction.accountId;
    const newCategoryId = updates.categoryId ?? transaction.categoryId;
    // undefined = key absent (keep); null = explicit clear; id = set
    const newBudgetId =
      updates.budgetId === undefined
        ? transaction.budgetId
        : (updates.budgetId ?? undefined);
    const newGoalId =
      updates.goalId === undefined
        ? transaction.goalId
        : (updates.goalId ?? undefined);

    const [originalAccount, originalCategory, newAccount, newCategory] =
      await Promise.all([
        ctx.db.get(transaction.accountId),
        ctx.db.get(transaction.categoryId),
        newAccountId === transaction.accountId
          ? Promise.resolve(null)
          : ctx.db.get(newAccountId),
        newCategoryId === transaction.categoryId
          ? Promise.resolve(null)
          : ctx.db.get(newCategoryId),
      ]);

    if (!originalAccount || originalAccount.userId !== userId) {
      throw new Error("Original account not found");
    }

    if (!originalCategory || originalCategory.userId !== userId) {
      throw new Error("Original category not found");
    }

    const resolvedNewAccount = newAccount ?? originalAccount;
    if (!resolvedNewAccount || resolvedNewAccount.userId !== userId) {
      throw new Error("Target account not found");
    }

    const resolvedNewCategory = newCategory ?? originalCategory;
    if (!resolvedNewCategory || resolvedNewCategory.userId !== userId) {
      throw new Error("Target category not found");
    }

    const newType = updates.type ?? transaction.type;
    if (resolvedNewCategory.type !== newType) {
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
    const oldGoalId = transaction.goalId;

    if (accountChanged || amountChanged || typeChanged) {
      await adjustAccount(ctx, originalAccount, oldAmount, oldType, -1);
      await adjustAccount(ctx, resolvedNewAccount, newAmount, newType, 1);
    }

    const oldBudgetTouched =
      (amountChanged || typeChanged || oldBudgetId !== newBudgetId) &&
      !!oldBudgetId &&
      oldType === "expense";
    const newBudgetTouched =
      (amountChanged || typeChanged || oldBudgetId !== newBudgetId) &&
      !!newBudgetId &&
      newType === "expense";
    const oldGoalTouched =
      (amountChanged || typeChanged || oldGoalId !== newGoalId) &&
      !!oldGoalId &&
      oldType === "expense";
    const newGoalTouched =
      (amountChanged || typeChanged || oldGoalId !== newGoalId) &&
      !!newGoalId &&
      newType === "expense";

    const [oldBudget, newBudget, oldGoal, newGoal] = await Promise.all([
      oldBudgetTouched && oldBudgetId
        ? ctx.db.get(oldBudgetId)
        : Promise.resolve(null),
      newBudgetTouched && newBudgetId
        ? ctx.db.get(newBudgetId)
        : Promise.resolve(null),
      oldGoalTouched && oldGoalId
        ? ctx.db.get(oldGoalId)
        : Promise.resolve(null),
      newGoalTouched && newGoalId
        ? ctx.db.get(newGoalId)
        : Promise.resolve(null),
    ]);

    const finalPatches: Promise<unknown>[] = [];

    if (categoryChanged || amountChanged || typeChanged) {
      if (categoryChanged) {
        finalPatches.push(
          ctx.db.patch(originalCategory._id, {
            transactionCount: originalCategory.transactionCount - 1,
            transactionAmount:
              originalCategory.transactionAmount - transaction.amount,
          }),
        );

        finalPatches.push(
          ctx.db.patch(resolvedNewCategory._id, {
            transactionCount: resolvedNewCategory.transactionCount + 1,
            transactionAmount:
              resolvedNewCategory.transactionAmount + newAmount,
          }),
        );
      } else {
        finalPatches.push(
          ctx.db.patch(originalCategory._id, {
            transactionCount: originalCategory.transactionCount,
            transactionAmount:
              originalCategory.transactionAmount -
              transaction.amount +
              newAmount,
          }),
        );
      }
    }

    const sameBudget =
      oldBudgetTouched &&
      newBudgetTouched &&
      oldBudgetId === newBudgetId;

    if (sameBudget && oldBudgetId && oldBudget && oldBudget.userId === userId) {
      // Same budget; amount changed. Transaction count is unchanged.
      const afterSubtract = Math.max((oldBudget.spent ?? 0) - oldAmount, 0);
      finalPatches.push(
        ctx.db.patch(oldBudgetId, {
          spent: afterSubtract + newAmount,
        }),
      );
    } else {
      if (
        oldBudgetTouched &&
        oldBudgetId &&
        oldBudget &&
        oldBudget.userId === userId
      ) {
        finalPatches.push(
          ctx.db.patch(oldBudgetId, {
            spent: Math.max((oldBudget.spent ?? 0) - oldAmount, 0),
            transactionCount: Math.max(oldBudget.transactionCount - 1, 0),
          }),
        );
      }

      if (
        newBudgetTouched &&
        newBudgetId &&
        newBudget &&
        newBudget.userId === userId
      ) {
        finalPatches.push(
          ctx.db.patch(newBudgetId, {
            spent: (newBudget.spent ?? 0) + newAmount,
            transactionCount: newBudget.transactionCount + 1,
          }),
        );
      }
    }

    const sameGoal =
      oldGoalTouched && newGoalTouched && oldGoalId === newGoalId;

    if (sameGoal && oldGoalId && oldGoal && oldGoal.userId === userId) {
      const afterSubtract = Math.max((oldGoal.saved ?? 0) - oldAmount, 0);
      finalPatches.push(
        ctx.db.patch(oldGoalId, {
          saved: afterSubtract + newAmount,
        }),
      );
    } else {
      if (
        oldGoalTouched &&
        oldGoalId &&
        oldGoal &&
        oldGoal.userId === userId
      ) {
        finalPatches.push(
          ctx.db.patch(oldGoalId, {
            saved: Math.max((oldGoal.saved ?? 0) - oldAmount, 0),
            transactionCount: Math.max(oldGoal.transactionCount - 1, 0),
          }),
        );
      }

      if (
        newGoalTouched &&
        newGoalId &&
        newGoal &&
        newGoal.userId === userId
      ) {
        finalPatches.push(
          ctx.db.patch(newGoalId, {
            saved: (newGoal.saved ?? 0) + newAmount,
            transactionCount: newGoal.transactionCount + 1,
          }),
        );
      }
    }

    await Promise.all(finalPatches);

    const {
      budgetId: _omitBudget,
      goalId: _omitGoal,
      ...restUpdates
    } = updates;

    await ctx.db.patch(id, {
      ...restUpdates,
      accountId: newAccountId,
      categoryId: newCategoryId,
      budgetId: newBudgetId,
      goalId: newGoalId,
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
    const userId = await requireUserId(ctx);

    const transaction = await ctx.db.get(id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const touchesBudget =
      !!transaction.budgetId && transaction.type === "expense";
    const touchesGoal =
      !!transaction.goalId && transaction.type === "expense";

    const [account, category, budget, goal] = await Promise.all([
      ctx.db.get(transaction.accountId),
      ctx.db.get(transaction.categoryId),
      touchesBudget ? ctx.db.get(transaction.budgetId!) : Promise.resolve(null),
      touchesGoal ? ctx.db.get(transaction.goalId!) : Promise.resolve(null),
    ]);

    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    const balanceDelta =
      transaction.type === "income" ? -transaction.amount : transaction.amount;

    const patches: Promise<unknown>[] = [
      ctx.db.patch(transaction.accountId, {
        balance: account.balance + balanceDelta,
        transactionCount: Math.max(account.transactionCount - 1, 0),
      }),
    ];

    if (category && category.userId === userId) {
      patches.push(
        ctx.db.patch(transaction.categoryId, {
          transactionCount: Math.max(category.transactionCount - 1, 0),
          transactionAmount: Math.max(
            category.transactionAmount - transaction.amount,
            0,
          ),
        }),
      );
    }

    if (touchesBudget && budget && budget.userId === userId) {
      patches.push(
        ctx.db.patch(transaction.budgetId!, {
          transactionCount: Math.max(budget.transactionCount - 1, 0),
          spent: Math.max((budget.spent ?? 0) - transaction.amount, 0),
        }),
      );
    }

    if (touchesGoal && goal && goal.userId === userId) {
      patches.push(
        ctx.db.patch(transaction.goalId!, {
          transactionCount: Math.max(goal.transactionCount - 1, 0),
          saved: Math.max((goal.saved ?? 0) - transaction.amount, 0),
        }),
      );
    }

    await Promise.all(patches);
    await ctx.db.delete(id);

    return id;
  },
});
