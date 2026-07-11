"use client";

import { useCallback, useRef } from "react";
import { useChatStore } from "@/stores/chat-store";
import { useDataStore } from "@/stores/data-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import type { LLMChatRequest, WidgetAction } from "@/types/ai";
import type { SSEEvent } from "@/types/chat";

const ACTION_MARKER_RE = /<<ACTION:(\{(?:[^{}]|"(?:\\.|[^"\\])*")*\})>>/g;

function stripActionMarkers(text: string): string {
  return text.replace(ACTION_MARKER_RE, "");
}

function extractActions(text: string): WidgetAction[] {
  const actions: WidgetAction[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(ACTION_MARKER_RE.source, "g");
  while ((match = re.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed?.type) {
        actions.push({ type: parsed.type, payload: parsed.payload });
      }
    } catch {
      // skip malformed markers
    }
  }
  return actions;
}

export function useChat() {
  const chatStore = useChatStore();
  const dataset = useDataStore((s) => s.dataset);
  const config = useDashboardStore((s) => s.config);

  // Accumulates raw tokens (with action markers) during a single stream.
  // Used to extract actions and build the final clean display text.
  const rawRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!dataset) return;

      // Abort any in-flight request before starting a new one
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      chatStore.addMessage("user", message);
      chatStore.setStreaming(true);
      chatStore.addMessage("assistant", "");
      rawRef.current = "";

      try {
        const request: LLMChatRequest = {
          message,
          columns: dataset.columns,
          sampleRows: dataset.rows.slice(0, 2),
          summary: dataset.summary,
          rowCount: dataset.rowCount,
          currentConfig: config ?? {
            id: "",
            schemaVersion: 1,
            title: "",
            widgets: [],
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          conversation: chatStore.messages
            .filter(
              (m): m is typeof m & { role: "user" | "assistant" } =>
                m.role === "user" || m.role === "assistant"
            )
            .map((m) => ({
              role: m.role,
              content: m.content,
              actions: m.actions,
            })),
        };

        const response = await fetch("/api/llm/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorBody = await response.text();
          let detail = "";
          try {
            const parsed = JSON.parse(errorBody);
            detail = parsed.error || errorBody;
          } catch {
            detail = errorBody;
          }
          throw new Error(`Chat request failed (${response.status}): ${detail}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let sseBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });

          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            let event: SSEEvent;
            try {
              event = JSON.parse(trimmed.slice(6));
            } catch {
              continue;
            }

            switch (event.type) {
              case "token": {
                rawRef.current += event.content;
                // Append display-safe portion (markers stripped) to the UI
                const cleaned = stripActionMarkers(event.content);
                if (cleaned) {
                  chatStore.appendToLastMessage(cleaned);
                }
                break;
              }
              case "done": {
                const actions = extractActions(rawRef.current);
                if (actions.length) {
                  const store = useDashboardStore.getState();
                  for (const action of actions) {
                    applyWidgetAction(store, action);
                  }
                  chatStore.setLastMessageActions(actions);
                }
                break;
              }
              case "error": {
                throw new Error(event.content);
              }
            }
          }
        }

        // Fallback: extract actions if stream ended without "done"
        const pending = extractActions(rawRef.current);
        if (pending.length) {
          const store = useDashboardStore.getState();
          for (const action of pending) {
            applyWidgetAction(store, action);
          }
          chatStore.setLastMessageActions(pending);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          chatStore.setStreaming(false);
          rawRef.current = "";
          return;
        }
        const last = chatStore.messages[chatStore.messages.length - 1];
        if (last?.role === "assistant" && !last.content) {
          useChatStore.setState((state) => {
            state.messages.pop();
          });
        }
        chatStore.addMessage(
          "assistant",
          error instanceof Error
            ? `Error: ${error.message}`
            : "Sorry, I encountered an error processing your request."
        );
      } finally {
        chatStore.setStreaming(false);
        rawRef.current = "";
      }
    },
    [dataset, config, chatStore]
  );

  return {
    messages: chatStore.messages,
    isStreaming: chatStore.isStreaming,
    isOpen: chatStore.isOpen,
    sendMessage,
    toggleOpen: chatStore.toggleOpen,
    setOpen: chatStore.setOpen,
    clearConversation: chatStore.clearConversation,
  };
}

function applyWidgetAction(
  store: ReturnType<typeof useDashboardStore.getState>,
  action: WidgetAction
): void {
  switch (action.type) {
    case "UPDATE_WIDGET": {
      const { id, ...rest } = action.payload as Record<string, unknown>;
      if (typeof id !== "string") break;
      store.updateWidget(id, rest as Parameters<typeof store.updateWidget>[1]);
      break;
    }
    case "ADD_WIDGET": {
      const payload = action.payload as { type: string; [key: string]: unknown };
      if (typeof payload.type !== "string") break;
      store.addWidget(
        payload.type as Parameters<typeof store.addWidget>[0],
        payload as Parameters<typeof store.addWidget>[1]
      );
      break;
    }
    case "REMOVE_WIDGET": {
      const id = action.payload as string;
      if (typeof id !== "string") break;
      store.removeWidget(id);
      break;
    }
    case "UPDATE_LAYOUT": {
      const { id, ...layout } = action.payload as Record<string, unknown>;
      if (typeof id !== "string") break;
      store.updateWidget(id, { layout } as unknown as Parameters<typeof store.updateWidget>[1]);
      break;
    }
    case "DUPLICATE_WIDGET": {
      const id = action.payload as string;
      if (typeof id !== "string") break;
      store.duplicateWidget(id);
      break;
    }
  }
}
