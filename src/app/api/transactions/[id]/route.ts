import { NextRequest, NextResponse } from "next/server";

import type { ITransaction } from "@/types/transaction";

import Transaction from "@/models/Transaction";

import dbConnect from "@/lib/mongodb";
import { handleError, handleNotFound, validateId } from "@/lib/api-helpers";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/transactions/[id]
 * Fetches a single transaction by ID.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  await dbConnect();

  const idValidationError = validateId(params.id, "Transaction ID");
  if (idValidationError) return idValidationError;

  try {
    const transaction = await Transaction.findById(params.id);
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
  await dbConnect();

  const idValidationError = validateId(params.id, "Transaction ID");
  if (idValidationError) return idValidationError;

  try {
    const body: Partial<ITransaction> = await request.json();
    const transaction = await Transaction.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

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
  await dbConnect();

  const idValidationError = validateId(params.id, "Transaction ID");
  if (idValidationError) return idValidationError;

  try {
    const transaction = await Transaction.findByIdAndDelete(params.id);
    if (!transaction) return handleNotFound("Transaction");

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
