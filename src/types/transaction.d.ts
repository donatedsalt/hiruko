import { Document, Model, Types } from "mongoose";

export interface ITransaction {
  userId: string;
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

interface ITransactionApiResponse {
  success: boolean;
  data?: ITransactionDocument[] | ITransactionDocument;
  error?: string;
}
