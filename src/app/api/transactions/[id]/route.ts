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
  const parsed = TransactionSchema.safeParse({ ...body, userId });

  if (!parsed.success) {
    const errorTree = z.treeifyError(parsed.error);
    return NextResponse.json(
      { success: false, error: errorTree },
      { status: 400 }
    );
  }

  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: params.id, userId },
      parsed.data,
      {
        new: true,
        runValidators: true,
      }
    );

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
