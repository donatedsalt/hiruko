import type { Id } from "@/convex/_generated/dataModel";

export interface IAccount {
  _id: Id<"accounts">;
  userId: string;
  name: string;
  balance: number;
  transactionsCount: number;
  updatedAt: number;
  _creationTime: number;
}
