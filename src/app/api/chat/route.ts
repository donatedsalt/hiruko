import { auth } from "@clerk/nextjs/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const MAX_BODY_BYTES = 32 * 1024;
const MAX_MESSAGES = 50;
const MAX_CONTENT_CHARS = 16_000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

const hits = new Map<string, number[]>();
function rateLimit(userId: string): boolean {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (recent.length >= RATE_MAX) {
    hits.set(userId, recent);
    return false;
  }
  recent.push(now);
  hits.set(userId, recent);
  return true;
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

function totalContentChars(messages: UIMessage[]): number {
  let total = 0;
  for (const m of messages) {
    for (const p of m.parts ?? []) {
      if (p.type === "text") total += p.text.length;
    }
  }
  return total;
}

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI unavailable" }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const buf = await req.arrayBuffer();
  if (buf.byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let messages: UIMessage[];
  try {
    const body = JSON.parse(new TextDecoder().decode(buf));
    if (!Array.isArray(body.messages))
      throw new Error("messages array required");
    messages = body.messages;
    if (messages.length === 0 || messages.length > MAX_MESSAGES) {
      throw new Error("message count out of range");
    }
    if (totalContentChars(messages) > MAX_CONTENT_CHARS) {
      throw new Error("content too long");
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!rateLimit(userId)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
    const result = streamText({
      model: google("gemini-2.0-flash-001"),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(
      "Gemini stream error:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
