import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import type { ChatMessage, MessageRole } from "@/types/chat";

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  isOpen: boolean;

  addMessage: (role: MessageRole, content: string) => string;
  appendToLastMessage: (chunk: string) => void;
  setStreaming: (streaming: boolean) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  clearConversation: () => void;
}

export const useChatStore = create<ChatState>()(
  immer((set) => ({
    messages: [],
    isStreaming: false,
    isOpen: false,

    addMessage: (role, content) => {
      const id = nanoid();
      const message: ChatMessage = {
        id,
        role,
        content,
        timestamp: Date.now(),
      };

      set((state) => {
        state.messages.push(message);
      });

      return id;
    },

    appendToLastMessage: (chunk) =>
      set((state) => {
        const last = state.messages[state.messages.length - 1];
        if (last && last.role === "assistant") {
          last.content += chunk;
        }
      }),

    setStreaming: (streaming) =>
      set((state) => {
        state.isStreaming = streaming;
      }),

    toggleOpen: () =>
      set((state) => {
        state.isOpen = !state.isOpen;
      }),

    setOpen: (open) =>
      set((state) => {
        state.isOpen = open;
      }),

    clearConversation: () =>
      set((state) => {
        state.messages = [];
      }),
  }))
);

export const selectLastMessage = (
  state: ChatState
): ChatMessage | null =>
  state.messages[state.messages.length - 1] ?? null;

export const selectMessageCount = (state: ChatState): number =>
  state.messages.length;
