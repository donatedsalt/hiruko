import type { Id } from "@/convex/_generated/dataModel";

export interface ITransaction {
  _id: Id<"transactions">;
  userId: string;
  accountId: Id<"accounts">;
  category: string;
  title?: string;
  note?: string;
  type: "income" | "expense";
  amount: number;
  transactionTime: number;
  updatedAt: number;
  _creationTime: number;
}
