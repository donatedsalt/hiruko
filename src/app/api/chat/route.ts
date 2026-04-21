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
const RATE_MAX_USER = 20;
// Higher per-IP cap accommodates shared NATs while still capping multi-account
// abuse from a single source. In-memory and per-process: not effective across
// serverless instances; treat as best-effort defence in depth.
const RATE_MAX_IP = 60;

const userHits = new Map<string, number[]>();
const ipHits = new Map<string, number[]>();

function rateLimit(
  bucket: Map<string, number[]>,
  key: string,
  limit: number,
): boolean {
  const now = Date.now();
  const recent = (bucket.get(key) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (recent.length >= limit) {
    bucket.set(key, recent);
    return false;
  }
  recent.push(now);
  bucket.set(key, recent);
  return true;
}

function getClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = req.headers.get("x-real-ip");
  return xri?.trim() || null;
}

// Per-process salt so map keys aren't reversible from a memory dump.
const IP_SALT = crypto.randomUUID();

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(IP_SALT + ip);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
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

  if (!rateLimit(userHits, userId, RATE_MAX_USER)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const ip = getClientIp(req);
  if (ip) {
    const ipKey = await hashIp(ip);
    if (!rateLimit(ipHits, ipKey, RATE_MAX_IP)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
    const result = streamText({
      model: google("gemini-2.0-flash-001"),
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
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
