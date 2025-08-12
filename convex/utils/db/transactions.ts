import { QueryCtx } from "@/convex/_generated/server";

import { getUserId } from "@/convex/utils/auth";

export const getUserTransactions = async (ctx: QueryCtx) => {
  const userId = await getUserId(ctx);
  if (!userId) return [];

  return ctx.db
    .query("transactions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
};
