import type { MutationCtx } from "@/convex/_generated/server";
import type {
  AccountId,
  BudgetId,
  CategoryId,
  GoalId,
  Transaction,
} from "@/types/convex";

type Delta = { count: number; amount: number };
type AccountDelta = { balance: number; count: number };

/**
 * Reverse the denormalized counter side-effects that a set of transactions
 * had on their parent accounts / categories / budgets / goals.
 *
 * Used by cascading deletes (account.remove / category.remove). Skips the
 * parent currently being deleted via `skipAccountId` / `skipCategoryId`.
 */
export async function reverseTransactionSideEffects(
  ctx: MutationCtx,
  userId: string,
  txns: Transaction[],
  opts: {
    skipAccountId?: AccountId;
    skipCategoryId?: CategoryId;
  } = {},
) {
  const accountDeltas = new Map<AccountId, AccountDelta>();
  const categoryDeltas = new Map<CategoryId, Delta>();
  const budgetDeltas = new Map<BudgetId, Delta>();
  const goalDeltas = new Map<GoalId, Delta>();

  for (const t of txns) {
    if (t.accountId !== opts.skipAccountId) {
      const d = accountDeltas.get(t.accountId) ?? { balance: 0, count: 0 };
      d.balance += t.type === "income" ? -t.amount : t.amount;
      d.count += 1;
      accountDeltas.set(t.accountId, d);
    }
    if (t.categoryId !== opts.skipCategoryId) {
      const d = categoryDeltas.get(t.categoryId) ?? { count: 0, amount: 0 };
      d.count += 1;
      d.amount += t.amount;
      categoryDeltas.set(t.categoryId, d);
    }
    if (t.budgetId && t.type === "expense") {
      const d = budgetDeltas.get(t.budgetId) ?? { count: 0, amount: 0 };
      d.count += 1;
      d.amount += t.amount;
      budgetDeltas.set(t.budgetId, d);
    }
    if (t.goalId && t.type === "expense") {
      const d = goalDeltas.get(t.goalId) ?? { count: 0, amount: 0 };
      d.count += 1;
      d.amount += t.amount;
      goalDeltas.set(t.goalId, d);
    }
  }

  const [accounts, categories, budgets, goals] = await Promise.all([
    Promise.all([...accountDeltas.keys()].map((id) => ctx.db.get(id))),
    Promise.all([...categoryDeltas.keys()].map((id) => ctx.db.get(id))),
    Promise.all([...budgetDeltas.keys()].map((id) => ctx.db.get(id))),
    Promise.all([...goalDeltas.keys()].map((id) => ctx.db.get(id))),
  ]);

  const patches: Promise<unknown>[] = [];

  for (const doc of accounts) {
    if (!doc || doc.userId !== userId) continue;
    const d = accountDeltas.get(doc._id)!;
    patches.push(
      ctx.db.patch(doc._id, {
        balance: doc.balance + d.balance,
        transactionCount: Math.max(doc.transactionCount - d.count, 0),
      }),
    );
  }
  for (const doc of categories) {
    if (!doc || doc.userId !== userId) continue;
    const d = categoryDeltas.get(doc._id)!;
    patches.push(
      ctx.db.patch(doc._id, {
        transactionCount: Math.max(doc.transactionCount - d.count, 0),
        transactionAmount: Math.max(doc.transactionAmount - d.amount, 0),
      }),
    );
  }
  for (const doc of budgets) {
    if (!doc || doc.userId !== userId) continue;
    const d = budgetDeltas.get(doc._id)!;
    patches.push(
      ctx.db.patch(doc._id, {
        transactionCount: Math.max(doc.transactionCount - d.count, 0),
        spent: Math.max((doc.spent ?? 0) - d.amount, 0),
      }),
    );
  }
  for (const doc of goals) {
    if (!doc || doc.userId !== userId) continue;
    const d = goalDeltas.get(doc._id)!;
    patches.push(
      ctx.db.patch(doc._id, {
        transactionCount: Math.max(doc.transactionCount - d.count, 0),
        saved: Math.max((doc.saved ?? 0) - d.amount, 0),
      }),
    );
  }

  await Promise.all(patches);
}
