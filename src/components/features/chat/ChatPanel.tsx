"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  UPDATE_WIDGET: "✏️ Updated a widget",
  ADD_WIDGET: "➕ Added a widget",
  REMOVE_WIDGET: "🗑️ Removed a widget",
  UPDATE_LAYOUT: "📐 Adjusted layout",
  DUPLICATE_WIDGET: "📋 Duplicated a widget",
};

export function ChatPanel() {
  const {
    messages,
    isStreaming,
    isOpen,
    sendMessage,
    toggleOpen,
    clearConversation,
  } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  // ── Closed state: FAB ──
  if (!isOpen) {
    return (
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-primary p-4 text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
        title="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  // ── Open state: chat panel ──
  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-96 flex-col rounded-lg border bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Ask about your data</h3>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Clear
            </button>
          )}
          <button
            onClick={toggleOpen}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Sparkles className="h-8 w-8 text-primary/40" />
            <p>Ask questions about your data</p>
            <p className="text-xs text-muted-foreground/60">
              Try: &quot;Which country generated the highest revenue?&quot;
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="mb-3">
            <div
              className={cn(
                "max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {msg.content || (msg.role === "assistant" && isStreaming ? (
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </span>
              ) : null)}
            </div>

            {/* Action badges */}
            {msg.actions && msg.actions.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {msg.actions.map((action, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                  >
                    {ACTION_LABELS[action.type] ?? `🔧 ${action.type}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          disabled={isStreaming}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="rounded-md bg-primary p-2 text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          title="Send"
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
