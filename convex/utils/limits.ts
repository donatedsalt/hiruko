/**
 * Per-mutation cascade cap. Convex transactions allow ~8192 writes; cascade
 * deletes need 1 write per child + a handful of parent patches, so we keep
 * a safety margin. If a cascade hits this cap we throw rather than silently
 * orphan rows. Future scale: switch to batch + ctx.scheduler.runAfter.
 */
export const MAX_CASCADE_TRANSACTIONS = 5000;

export function cascadeCapError(entity: string) {
  return new Error(
    `Cannot delete ${entity}: it has more than ${MAX_CASCADE_TRANSACTIONS.toLocaleString()} linked transactions. Delete some transactions first or contact support.`,
  );
}
