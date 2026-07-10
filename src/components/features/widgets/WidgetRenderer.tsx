"use client";

import { Suspense } from "react";
import { useDataStore } from "@/stores/data-store";
import { getWidgetComponent, isRegistered } from "./WidgetRegistry";
import { WidgetErrorBoundary } from "./WidgetErrorBoundary";
import { WidgetFallback } from "./WidgetFallback";
import { validateWidgetConfig, isWidgetConfig } from "./WidgetValidator";
import type { WidgetConfig } from "@/types/dashboard";

interface WidgetRendererProps {
  widget: WidgetConfig;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const dataset = useDataStore((s) => s.dataset);
  const data = dataset?.rows ?? [];

  const validation = validateWidgetConfig(widget);

  if (!validation.valid) {
    return (
      <WidgetFallback
        type="invalid"
        title={widget.title}
        message={validation.errors.join("; ")}
      />
    );
  }

  if (!isRegistered(widget.type)) {
    return (
      <WidgetFallback
        type="invalid"
        title={widget.title}
        message={`Unsupported widget type: "${widget.type}"`}
      />
    );
  }

  if (!data.length) {
    return (
      <WidgetFallback
        type="empty"
        title={widget.title}
        message="Upload data to populate this widget"
      />
    );
  }

  const Component = getWidgetComponent(widget.type);

  if (!Component) {
    return (
      <WidgetFallback
        type="invalid"
        title={widget.title}
        message="Widget component failed to load"
      />
    );
  }

  return (
    <WidgetErrorBoundary widgetId={widget.id} widgetTitle={widget.title}>
      <Suspense
        fallback={
          <WidgetFallback type="loading" title={widget.title} />
        }
      >
        <Component widget={widget} data={data} />
      </Suspense>
    </WidgetErrorBoundary>
  );
}
