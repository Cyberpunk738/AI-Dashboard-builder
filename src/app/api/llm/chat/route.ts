import { NextRequest, NextResponse } from "next/server";
import { buildChatPrompt } from "@/lib/ai/prompt-builder";
import {
  getActiveProvider,
  buildHeaders,
  getBaseUrl,
  requireApiKey,
} from "@/lib/ai/provider";
import type { LLMChatRequest, LLMChatResponse } from "@/types/ai";

export async function POST(request: NextRequest) {
  try {
    const body: LLMChatRequest = await request.json();

    if (!body.message || !body.columns?.length) {
      return NextResponse.json(
        { error: "Invalid request: message and columns required" },
        { status: 400 }
      );
    }

    const { provider, apiKey, model } = getActiveProvider();
    requireApiKey(provider, apiKey);

    const prompt = buildChatPrompt({
      message: body.message,
      columns: body.columns,
      sampleRows: body.sampleRows,
      currentConfig: body.currentConfig,
      conversation: body.conversation,
    });

    const response = await fetch(getBaseUrl(provider), {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        model,
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
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { text: "Sorry, I encountered an error.", error: errorBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

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
