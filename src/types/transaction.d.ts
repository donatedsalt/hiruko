import { Document, Model, Types } from "mongoose";

export interface ITransaction {
  name: string;
  type: "income" | "expense";
  amount: number;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionModel extends Model<ITransactionDocument> {
  findIncomeTransactions(): Promise<ITransactionDocument[]>;
  findExpenseTransactions(): Promise<ITransactionDocument[]>;
}
