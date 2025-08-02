import z from "zod";
import { NextRequest, NextResponse } from "next/server";

import type { IAccount } from "@/types/account";

import dbConnect from "@/lib/mongodb";
import { authUser } from "@/lib/auth-user";
import { handleError } from "@/lib/api-helpers";

import { AccountSchema } from "@/validation/account";

import Account from "@/models/Account";

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
  try {
    const account = await Account.create(parsed.data);

    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
