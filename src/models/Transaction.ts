import mongoose, { Schema } from "mongoose";

import type {
  ITransactionDocument,
  ITransactionModel,
} from "@/types/transaction";

const transactionSchema: Schema<ITransactionDocument> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Transaction name is required"],
      trim: true,
      minlength: [3, "Transaction name must be at least 3 characters long"],
      maxlength: [100, "Transaction name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0, "Transaction amount cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.statics.findIncomeTransactions = async function (): Promise<
  ITransactionDocument[]
> {
  return this.find({ type: "income" });
};

transactionSchema.statics.findExpenseTransactions = async function (): Promise<
  ITransactionDocument[]
> {
  return this.find({ type: "expense" });
};

const Transaction: ITransactionModel =
  (mongoose.models.Transaction as ITransactionModel) ||
  mongoose.model<ITransactionDocument, ITransactionModel>(
    "Transaction",
    transactionSchema
  );

export default Transaction;
