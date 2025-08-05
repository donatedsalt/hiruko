import z from "zod";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import type { ITransaction } from "@/types/transaction";

import dbConnect from "@/lib/mongodb";
import { handleError, handleNotFound, validateId } from "@/lib/api-helpers";
import { authUser } from "@/lib/auth-user";

import { TransactionSchema } from "@/validation/transaction";

import Transaction from "@/models/Transaction";
import Account from "@/models/Account";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/transactions/[id]
 * Fetches a single transaction by ID.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { userId, error } = await authUser();
  if (error) return error;

  await dbConnect();

  const idValidationError = validateId(params.id, "Transaction ID");
  if (idValidationError) return idValidationError;

  try {
    const transaction = await Transaction.findOne({
      _id: params.id,
      userId,
    }).populate("account");
    if (!transaction) return handleNotFound("Transaction");

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/transactions/[id]
 * Updates an existing transaction by ID.
 * Request Body: Partial<ITransaction> (only fields to update)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId, error } = await authUser();
  if (error) return error;

  await dbConnect();

  const idValidationError = validateId(params.id, "Transaction ID");
  if (idValidationError) return idValidationError;

  const body: Partial<ITransaction> = await request.json();

  if (Object.keys(body).length === 0) {
    return NextResponse.json(
      { success: false, error: "At least one field must be provided." },
      { status: 400 }
    );
  }

  const parsed = TransactionSchema.partial().safeParse({ ...body, userId });

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
    const existingTransaction = await Transaction.findOne(
      { _id: params.id, userId },
      null,
      { session }
    );

    if (!existingTransaction) {
      await session.abortTransaction();
      return handleNotFound("Transaction");
    }

    const updatedData = parsed.data;

    const amountChanged =
      updatedData.amount !== undefined &&
      updatedData.amount !== existingTransaction.amount;

    const accountChanged =
      updatedData.account !== undefined &&
      updatedData.account.toString() !==
        existingTransaction.account?.toString();

    const typeChanged =
      updatedData.type !== undefined &&
      updatedData.type !== existingTransaction.type;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: params.id, userId },
      updatedData,
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedTransaction) {
      await session.abortTransaction();
      return handleNotFound("Transaction");
    }

    if (
      existingTransaction.account &&
      (amountChanged || accountChanged || typeChanged)
    ) {
      const oldMultiplier = existingTransaction.type === "expense" ? 1 : -1;

      await Account.findByIdAndUpdate(
        existingTransaction.account,
        {
          $inc: {
            balance: oldMultiplier * existingTransaction.amount,
            ...(accountChanged ? { transactionsCount: -1 } : {}),
          },
        },
        { session }
      );
    }

    if (updatedTransaction.account) {
      const newMultiplier = updatedTransaction.type === "expense" ? -1 : 1;

      await Account.findByIdAndUpdate(
        updatedTransaction.account,
        {
          $inc: {
            balance: newMultiplier * updatedTransaction.amount,
            ...(accountChanged ? { transactionsCount: 1 } : {}),
          },
        },
        { session }
      );
    }

    await session.commitTransaction();

    return NextResponse.json(
      { success: true, data: updatedTransaction },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    return handleError(error);
  } finally {
    session.endSession();
  }
}

/**
 * DELETE /api/transactions/[id]
 * Deletes a transaction by ID.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId, error } = await authUser();
  if (error) return error;

  await dbConnect();

  const idValidationError = validateId(params.id, "Transaction ID");
  if (idValidationError) return idValidationError;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findOneAndDelete(
      { _id: params.id, userId },
      { session }
    );

    if (!transaction) {
      await session.abortTransaction();
      return handleNotFound("Transaction");
    }

    if (transaction.account) {
      await Account.findByIdAndUpdate(
        transaction.account,
        {
          $inc: {
            balance:
              transaction.type === "expense"
                ? transaction.amount
                : -transaction.amount,
            transactionsCount: -1,
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 200 }
    );
  } catch (err) {
    await session.abortTransaction();
    return handleError(err);
  } finally {
    session.endSession();
  }
}
