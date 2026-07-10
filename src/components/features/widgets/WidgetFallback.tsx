"use client";

import { AlertTriangle, Bug, Loader2, Database, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface FallbackProps {
  type: "loading" | "error" | "invalid" | "empty";
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const CONFIG: Record<
  FallbackProps["type"],
  {
    icon: typeof AlertTriangle;
    label: string;
    defaultMessage: string;
  }
> = {
  loading: {
    icon: Loader2,
    label: "Loading",
    defaultMessage: "Rendering widget...",
  },
  error: {
    icon: Bug,
    label: "Render Error",
    defaultMessage: "Something went wrong rendering this widget.",
  },
  invalid: {
    icon: Settings,
    label: "Invalid Config",
    defaultMessage: "This widget has an invalid configuration.",
  },
  empty: {
    icon: Database,
    label: "No Data",
    defaultMessage: "No data available for this widget.",
  },
};

export function WidgetFallback({
  type,
  title,
  message,
  onRetry,
  className,
}: FallbackProps) {
  const config = CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-3 p-6 text-center",
        type === "error" && "bg-destructive/5",
        className
      )}
      role={type === "error" ? "alert" : "status"}
    >
      <div
        className={cn(
          "rounded-full p-3",
          type === "error" && "bg-destructive/10",
          type === "invalid" && "bg-amber-500/10",
          type === "empty" && "bg-muted",
          type === "loading" && "bg-muted"
        )}
      >
        <Icon
          className={cn(
            "h-6 w-6",
            type === "error" && "text-destructive",
            type === "invalid" && "text-amber-500",
            type === "empty" && "text-muted-foreground",
            type === "loading" && "h-5 w-5 animate-spin text-muted-foreground"
          )}
        />
      </div>
      <div>
        <p className="text-sm font-medium">
          {title ? `${title} — ${config.label}` : config.label}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {message ?? config.defaultMessage}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      )}
    </div>
  );
}
