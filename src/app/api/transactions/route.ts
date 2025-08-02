import z from "zod";
import { NextRequest, NextResponse } from "next/server";

import type { ITransaction, ITransactionDocument } from "@/types/transaction";

import dbConnect from "@/lib/mongodb";
import { handleError } from "@/lib/api-helpers";
import { authUser } from "@/lib/auth-user";

import { TransactionSchema } from "@/validation/transaction";

import Transaction from "@/models/Transaction";

/**
 * GET /api/transactions
 * Fetches all transactions or filters by type (income/expense).
 * Query Parameters:
 * - type: 'income' | 'expense' (optional)
 */
export async function GET(request: NextRequest) {
  const { userId, error } = await authUser();
  if (error) return error;

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let transactions: ITransactionDocument[];
    if (type === "income") {
      transactions = await Transaction.findIncomeTransactions({ userId });
    } else if (type === "expense") {
      transactions = await Transaction.findExpenseTransactions({ userId });
    } else {
      transactions = await Transaction.find({ userId }).sort({
        transactionTime: -1,
      });
    }

    return NextResponse.json(
      { success: true, data: transactions },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/transactions
 * Creates a new transaction.
 * Request Body: ITransaction (name, type, amount)
 */
export async function POST(request: NextRequest) {
  const { userId, error } = await authUser();
  if (error) return error;

  await dbConnect();

  const body: ITransaction = await request.json();
  const parsed = TransactionSchema.safeParse({ ...body, userId });

  if (!parsed.success) {
    const errorTree = z.treeifyError(parsed.error);
    return NextResponse.json(
      { success: false, error: errorTree },
      { status: 400 }
    );
  }
  try {
    const transaction = await Transaction.create(parsed.data);

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
