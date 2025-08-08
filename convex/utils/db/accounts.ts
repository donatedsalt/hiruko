import { MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

export const adjustAccount = async (
  ctx: MutationCtx,
  account: { _id: Id<"accounts">; balance: number; transactionsCount?: number },
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
