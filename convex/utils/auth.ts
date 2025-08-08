import type { QueryCtx, MutationCtx } from "../_generated/server";

export const getUserId = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
};
