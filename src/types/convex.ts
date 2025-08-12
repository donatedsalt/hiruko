import { Doc, Id } from "@/convex/_generated/dataModel";

export type Transaction = Doc<"transactions">;
export type TransactionId = Id<"transactions">;
export type TransactionGroups = Record<string, Transaction[]>;

export type Account = Doc<"accounts">;
export type AccountId = Id<"accounts">;
