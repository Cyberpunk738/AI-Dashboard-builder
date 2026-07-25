import { NextRequest, NextResponse } from "next/server";
import { generateDashboard } from "@/lib/ai/llm-service";
import { getActiveProvider } from "@/lib/ai/provider";
import { generateFallbackDashboard } from "@/lib/parsing/auto-dashboard";
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
    
    // If no API key configured, generate deterministic local dashboard directly
    if (!apiKey) {
      const fallbackConfig = generateFallbackDashboard({
        columns: body.columns,
        sampleRows: body.sampleRows,
        fileName: body.fileName,
      });
      return NextResponse.json({ config: fallbackConfig, raw: null });
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
      console.warn("LLM API failed or rate-limited. Falling back to local JavaScript dashboard generator:", result.error);
      const fallbackConfig = generateFallbackDashboard({
        columns: body.columns,
        sampleRows: body.sampleRows,
        fileName: body.fileName,
      });
      return NextResponse.json({
        config: fallbackConfig,
        raw: null,
        notice: `Generated via local JS analyzer (${result.error})`,
      });
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

