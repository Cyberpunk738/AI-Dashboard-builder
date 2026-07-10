"use client";

import { useCallback } from "react";
import { useChatStore } from "@/stores/chat-store";
import { useDataStore } from "@/stores/data-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import type { LLMChatRequest, LLMChatResponse } from "@/types/ai";

export function useChat() {
  const chatStore = useChatStore();
  const dataset = useDataStore((s) => s.dataset);
  const config = useDashboardStore((s) => s.config);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!dataset) return;

      chatStore.addMessage("user", message);
      chatStore.setStreaming(true);

      try {
        const request: LLMChatRequest = {
          message,
          columns: dataset.columns,
          sampleRows: dataset.rows.slice(0, 10),
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
            })),
        };

        const response = await fetch("/api/llm/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error("Chat request failed");
        }

        const result: LLMChatResponse = await response.json();
        chatStore.addMessage("assistant", result.text);

        if (result.actions) {
          const dashboardStore = useDashboardStore.getState();
          for (const action of result.actions) {
            switch (action.type) {
              case "UPDATE_WIDGET":
                dashboardStore.updateWidget(
                  (action.payload as { id: string }).id,
                  action.payload as Record<string, unknown>
                );
                break;
              case "ADD_WIDGET":
                dashboardStore.addWidget(
                  (action.payload as { type: string }).type as any
                );
                break;
              case "REMOVE_WIDGET":
                dashboardStore.removeWidget(
                  action.payload as string
                );
                break;
            }
          }
        }
      } catch (error) {
        chatStore.addMessage(
          "assistant",
          "Sorry, I encountered an error processing your request."
        );
      } finally {
        chatStore.setStreaming(false);
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
