import { NextRequest } from "next/server";
import { buildChatPrompt } from "@/lib/ai/prompt-builder";
import {
  getActiveProvider,
  buildHeaders,
  getBaseUrl,
  requireApiKey,
} from "@/lib/ai/provider";
import type { LLMChatRequest } from "@/types/ai";

export async function POST(request: NextRequest) {
  try {
    const body: LLMChatRequest = await request.json();

    if (!body.message || !body.columns?.length) {
      return new Response(
        JSON.stringify({ error: "message and columns required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { provider, apiKey, model } = getActiveProvider();
    requireApiKey(provider, apiKey);

    const prompt = buildChatPrompt({
      message: body.message,
      columns: body.columns,
      sampleRows: body.sampleRows,
      summary: body.summary,
      rowCount: body.rowCount,
      currentConfig: body.currentConfig,
      conversation: body.conversation,
    });

    const response = await fetch(`${getBaseUrl(provider)}`, {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful dashboard assistant that responds naturally.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(
        JSON.stringify({
          error: `LLM API error (${response.status}): ${errorBody}`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const reader = response.body?.getReader();
    if (!reader) {
      return new Response(
        JSON.stringify({ error: "No response body" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const readable = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              let parsed: {
                choices?: Array<{ delta: { content?: string } }>;
              };
              try {
                parsed = JSON.parse(data);
              } catch {
                continue;
              }

              const token = parsed.choices?.[0]?.delta?.content ?? "";
              if (!token) continue;

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "token", content: token })}\n\n`
                )
              );
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                content: err instanceof Error ? err.message : "Stream error",
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat stream error:", error);
    return new Response(
      `data: ${JSON.stringify({
        type: "error",
        content: error instanceof Error ? error.message : "Chat stream failed",
      })}\n\n`,
      {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }
}
