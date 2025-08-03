import { Document, Model, Types } from "mongoose";

import { IAccountDocument } from "@/types/account";

export interface ITransaction {
  userId: string;
  account: Types.ObjectId | IAccountDocument;
  category: string;
  title?: string;
  note?: string;
  type: "income" | "expense";
  amount: number;
  transactionTime: Date;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionModel extends Model<ITransactionDocument> {
  findIncomeTransactions({
    userId,
  }: {
    userId: string;
  }): Promise<ITransactionDocument[]>;
  findExpenseTransactions({
    userId,
  }: {
    userId: string;
  }): Promise<ITransactionDocument[]>;
}

export interface ITransactionApiResponse {
  success: boolean;
  data?: ITransactionDocument[] | ITransactionDocument;
  error?: string;
}
