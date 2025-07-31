import { Document, Types } from "mongoose";

export interface IAccount {
  userId: string;
  name: string;
  balance: number;
  transactionsCount: number;
}

export interface IAccountDocument extends IAccount, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountApiResponse {
  success: boolean;
  data?: IAccountDocument[] | IAccountDocument;
  error?: string;
}
