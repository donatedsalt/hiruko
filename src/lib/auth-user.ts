import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function authUser() {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { userId };
}
