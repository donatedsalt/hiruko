import z from "zod";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import type { IAccount } from "@/types/account";

import dbConnect from "@/lib/mongodb";
import { authUser } from "@/lib/auth-user";
import { handleError } from "@/lib/api-helpers";

import { AccountSchema } from "@/validation/account";
import { TransactionSchema } from "@/validation/transaction";

import Account from "@/models/Account";
import Transaction from "@/models/Transaction";

/**
 * GET /api/accounts
 * Fetches all accounts.
 */
export async function GET(_request: NextRequest) {
  const { userId, error } = await authUser();
  if (error) return error;

  await dbConnect();

  try {
    const accounts = await Account.find({ userId });

    return NextResponse.json(
      { success: true, data: accounts },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/accounts
 * Creates a new account.
 * Request Body: IAccount.
 */
export async function POST(request: NextRequest) {
  const { userId, error } = await authUser();
  if (error) return error;

  await dbConnect();

  const body: IAccount = await request.json();
  const parsed = AccountSchema.safeParse({
    ...body,
    userId,
  });

  if (!parsed.success) {
    const errorTree = z.treeifyError(parsed.error);
    return NextResponse.json(
      { success: false, error: errorTree },
      { status: 400 }
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [newAccount] = await Account.create([parsed.data], { session });

    if (newAccount.balance !== 0) {
      const type = newAccount.balance > 0 ? "income" : "expense";

      const correctionTransaction = {
        userId,
        account: newAccount._id.toString(),
        category: "balance correction",
        type,
        amount: Math.abs(newAccount.balance),
        note: "Initial balance correction",
        transactionTime: new Date(),
      };

      const transactionParse = TransactionSchema.safeParse(
        correctionTransaction
      );

      if (!transactionParse.success) {
        await session.abortTransaction();
        const errorTree = z.treeifyError(transactionParse.error);
        return NextResponse.json(
          { success: false, error: errorTree },
          { status: 400 }
        );
      }

      await Transaction.create([transactionParse.data], { session });

      await Account.findByIdAndUpdate(
        newAccount._id,
        { $inc: { transactionsCount: 1 } },
        { session }
      );
    }

    await session.commitTransaction();
    return NextResponse.json(
      { success: true, data: newAccount },
      { status: 201 }
    );
  } catch (error) {
    await session.abortTransaction();
    return handleError(error);
  } finally {
    session.endSession();
  }
}
