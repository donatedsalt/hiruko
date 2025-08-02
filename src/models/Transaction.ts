import mongoose, { Schema } from "mongoose";

import type {
  ITransactionDocument,
  ITransactionModel,
} from "@/types/transaction";

const transactionSchema: Schema<ITransactionDocument> = new Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Account ID is required"],
    },
    category: {
      type: String,
      required: [true, "Transaction category is required"],
      trim: true,
      minlength: [3, "Transaction category must be at least 3 characters long"],
      maxlength: [100, "Transaction category cannot exceed 100 characters"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Transaction title cannot exceed 100 characters"],
      default: "",
    },
    note: {
      type: String,
      trim: true,
      default: "",
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
    transactionTime: {
      type: Date,
      required: [true, "Transaction time is required"],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.statics.findIncomeTransactions = async function ({
  userId,
}: {
  userId: string;
}): Promise<ITransactionDocument[]> {
  return this.find({ type: "income", userId }).sort({ transactionTime: -1 });
};

transactionSchema.statics.findExpenseTransactions = async function ({
  userId,
}: {
  userId: string;
}): Promise<ITransactionDocument[]> {
  return this.find({ type: "expense", userId }).sort({ transactionTime: -1 });
};

transactionSchema.index({ userId: 1, type: 1, createdAt: -1 });

const Transaction: ITransactionModel =
  (mongoose.models.Transaction as ITransactionModel) ||
  mongoose.model<ITransactionDocument, ITransactionModel>(
    "Transaction",
    transactionSchema
  );

export default Transaction;
