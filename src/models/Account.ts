import mongoose, { Schema, Model } from "mongoose";
import type { IAccountDocument } from "@/types/account";

const accountSchema: Schema<IAccountDocument> = new Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
      minlength: [3, "Account name must be at least 3 characters long"],
      maxlength: [100, "Account name cannot exceed 100 characters"],
    },
    balance: {
      type: Number,
      min: [0, "Account balance cannot be negative"],
      default: 0,
    },
    transactionsCount: {
      type: Number,
      min: [0, "transactions Count cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({ userId: 1 });

const Account =
  (mongoose.models.Account as Model<IAccountDocument>) ||
  mongoose.model<IAccountDocument>("Account", accountSchema);

export default Account;
