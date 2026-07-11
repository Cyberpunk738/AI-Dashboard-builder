import type { WidgetAction } from "./ai";

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  actions?: WidgetAction[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatInput {
  message: string;
}

// ── Streaming SSE event types ──

export interface SSETokenEvent {
  type: "token";
  content: string;
}

export interface SSEActionEvent {
  type: "action";
  content: WidgetAction;
}

export interface SSEDoneEvent {
  type: "done";
  actions?: WidgetAction[];
}

export interface SSEErrorEvent {
  type: "error";
  content: string;
}

export type SSEEvent =
  | SSETokenEvent
  | SSEActionEvent
  | SSEDoneEvent
  | SSEErrorEvent;
