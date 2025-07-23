import { NextResponse } from "next/server";
import type { NextResponse as NextResponseType } from "next/server";

import type { MongooseValidationError } from "@/types/mongoose-errors";

export function handleError(error: unknown): NextResponseType {
  console.error("API Error:", error);

  if (error instanceof Error && error.name === "ValidationError") {
    const validationError = error as MongooseValidationError;
    const messages = Object.values(validationError.errors).map(
      (err) => err.message
    );
    return NextResponse.json(
      { success: false, error: messages.join(", ") },
      { status: 400 }
    );
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "An unknown error occurred.";

  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

export function handleNotFound(entity = "Resource", status = 404) {
  return NextResponse.json(
    { success: false, error: `${entity} not found.` },
    { status }
  );
}

export function validateId(
  id: string | undefined,
  entity = "ID"
): NextResponseType | null {
  if (!id) {
    return NextResponse.json(
      { success: false, error: `${entity} is required.` },
      { status: 400 }
    );
  }
  return null;
}
