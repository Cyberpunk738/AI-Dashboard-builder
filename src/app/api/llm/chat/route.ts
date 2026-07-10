import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildChatPrompt } from "@/lib/ai/prompt-builder";
import type { LLMChatRequest, LLMChatResponse } from "@/types/ai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

export async function POST(request: NextRequest) {
  try {
    const body: LLMChatRequest = await request.json();

    if (!body.message || !body.columns?.length) {
      return NextResponse.json(
        { error: "Invalid request: message and columns required" },
        { status: 400 }
      );
    }

    const prompt = buildChatPrompt({
      message: body.message,
      columns: body.columns,
      sampleRows: body.sampleRows,
      currentConfig: body.currentConfig,
      conversation: body.conversation,
    });

    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful dashboard assistant. Respond with valid JSON containing text and optional actions.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from LLM" },
        { status: 502 }
      );
    }

    const result: LLMChatResponse = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("LLM chat error:", error);
    return NextResponse.json(
      {
        text: "Sorry, I encountered an error.",
        error:
          error instanceof Error
            ? error.message
            : "Chat request failed",
      },
      { status: 500 }
    );
  }
}
