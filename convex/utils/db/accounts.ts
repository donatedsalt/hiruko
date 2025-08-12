import { MutationCtx } from "@/convex/_generated/server";
import { AccountId } from "@/types/convex";

export const adjustAccount = async (
  ctx: MutationCtx,
  account: { _id: AccountId; balance: number; transactionsCount?: number },
  amount: number,
  type: "income" | "expense",
  delta: number
) => {
  const balanceDelta = type === "income" ? amount : -amount;

  await ctx.db.patch(account._id, {
    balance: account.balance + balanceDelta,
    transactionsCount: (account.transactionsCount ?? 0) + delta,
  });
};
