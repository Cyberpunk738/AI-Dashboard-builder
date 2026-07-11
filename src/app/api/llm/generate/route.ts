import { NextRequest, NextResponse } from "next/server";
import { generateDashboard } from "@/lib/ai/llm-service";
import { getActiveProvider } from "@/lib/ai/provider";
import type { LLMGenerateRequest, LLMGenerateResponse } from "@/types/ai";

export async function POST(request: NextRequest) {
  try {
    const body: LLMGenerateRequest = await request.json();

    if (!body.columns?.length || !body.sampleRows?.length) {
      return NextResponse.json(
        { error: "Invalid request: columns and sampleRows required" },
        { status: 400 }
      );
    }

    const { apiKey, model } = getActiveProvider();
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI provider API key not configured" },
        { status: 500 }
      );
    }

    const result = await generateDashboard(
      {
        columns: {
          columns: body.columns,
          sampleRows: body.sampleRows,
          summary: body.summary,
          rowCount: body.rowCount,
          fileName: body.fileName,
        },
      },
      {
        apiKey,
        model,
      }
    );

    if (!result.success) {
      const status =
        result.code === "INVALID_REQUEST" ? 400 : 502;
      return NextResponse.json(
        { error: result.error, code: result.code, details: result.details },
        { status }
      );
    }

    const response: LLMGenerateResponse = {
      config: result.config,
      raw: result.raw,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("LLM generate error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate dashboard",
      },
      { status: 500 }
    );
  }
}
