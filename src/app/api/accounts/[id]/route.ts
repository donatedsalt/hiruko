import z from "zod";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import type { IAccount } from "@/types/account";

import dbConnect from "@/lib/mongodb";
import { handleError, handleNotFound, validateId } from "@/lib/api-helpers";
import { authUser } from "@/lib/auth-user";

import { AccountSchema } from "@/validation/account";

import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { TransactionSchema } from "@/validation/transaction";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/accounts/[id]
 * Fetches a single account by ID.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { userId, error } = await authUser();
  if (error) return error;

  await dbConnect();

  const idValidationError = validateId(params.id, "Account ID");
  if (idValidationError) return idValidationError;

  try {
    const account = await Account.findOne({
      _id: params.id,
      userId,
    });

    if (!account) return handleNotFound("Account");

    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/accounts/[id]
 * Updates an existing account by ID.
 * Request Body: Partial<IAccount> (only fields to update)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId, error } = await authUser();
  if (error) return error;

  await dbConnect();

  const idValidationError = validateId(params.id, "Account ID");
  if (idValidationError) return idValidationError;

  const body: Partial<IAccount> = await request.json();
  const parsed = AccountSchema.safeParse({ ...body, userId });

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
    const existingAccount = await Account.findOne({
      _id: params.id,
      userId,
    }).session(session);
    if (!existingAccount) {
      await session.abortTransaction();
      return handleNotFound("Account");
    }

    const oldBalance = existingAccount.balance;
    const newBalance = parsed.data.balance;

    const account = await Account.findOneAndUpdate(
      { _id: params.id, userId },
      parsed.data,
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!account) {
      await session.abortTransaction();
      return handleNotFound("Account");
    }

    if (
      typeof newBalance === "number" &&
      typeof oldBalance === "number" &&
      newBalance !== oldBalance
    ) {
      const difference = newBalance - oldBalance;
      const type = difference > 0 ? "income" : "expense";

      const correctionTransaction = {
        userId,
        account: account._id.toString(),
        category: "balance correction",
        type,
        note: "Balance manually adjusted",
        amount: Math.abs(difference),
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
        account._id,
        { $inc: { transactionsCount: 1 } },
        { session }
      );
    }

    await session.commitTransaction();

    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error) {
    await session.abortTransaction();
    return handleError(error);
  } finally {
    session.endSession();
  }
}

/**
 * DELETE /api/accounts/[id]
 * Deletes an account by ID and all its associated transactions (in a transaction).
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId, error } = await authUser();
  if (error) return error;

  await dbConnect();

  const idValidationError = validateId(params.id, "Account ID");
  if (idValidationError) return idValidationError;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const account = await Account.findOneAndDelete(
      { _id: params.id, userId },
      { session }
    );

    if (!account) {
      await session.abortTransaction();
      return handleNotFound("Account");
    }

    const transactionsDeleteResult = await Transaction.deleteMany(
      { account: account._id, userId },
      { session }
    );

    await session.commitTransaction();
    return NextResponse.json(
      {
        success: true,
        data: {
          account,
          transactionsDeleted: transactionsDeleteResult.deletedCount,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    await session.abortTransaction();
    return handleError(err);
  } finally {
    session.endSession();
  }
}
