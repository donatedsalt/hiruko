import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.0-flash-001",
      contents: prompt,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(
                new TextEncoder().encode(JSON.stringify({ token: text }) + "\n")
              );
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Gemini stream error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
