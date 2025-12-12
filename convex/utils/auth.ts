import type { QueryCtx, MutationCtx } from "@/convex/_generated/server";

export const getUserId = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
};

export const requireUserId = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getUserId(ctx);
  if (!userId) throw new Error("Unauthorized: User not logged in.");
  return userId;
};
