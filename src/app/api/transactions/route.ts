import { NextRequest, NextResponse } from "next/server";

import type { ITransaction, ITransactionDocument } from "@/types/transaction";

import dbConnect from "@/lib/mongodb";
import { handleError } from "@/lib/api-helpers";

import Transaction from "@/models/Transaction";

/**
 * GET /api/transactions
 * Fetches all transactions or filters by type (income/expense).
 * Query Parameters:
 * - type: 'income' | 'expense' (optional)
 */
export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let transactions: ITransactionDocument[];
    if (type === "income") {
      transactions = await Transaction.findIncomeTransactions();
    } else if (type === "expense") {
      transactions = await Transaction.findExpenseTransactions();
    } else {
      transactions = await Transaction.find({});
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
  await dbConnect();

  try {
    const body: ITransaction = await request.json();

    if (!body.name || !body.type || typeof body.amount !== "number") {
      return NextResponse.json(
        { success: false, error: "Name, type, and amount are required." },
        { status: 400 }
      );
    }

    const transaction = await Transaction.create(body);

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
