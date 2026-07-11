"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useDataStore } from "@/stores/data-store";
import type { DashboardConfig } from "@/types/dashboard";
import type { LLMGenerateRequest, LLMGenerateResponse } from "@/types/ai";

export function useDashboard() {
  const store = useDashboardStore();
  const dataset = useDataStore((s) => s.dataset);

  const createDashboard = useCallback(
    (title?: string) => {
      const config: DashboardConfig = {
        id: nanoid(),
        schemaVersion: 1,
        title: title ?? `Dashboard - ${new Date().toLocaleDateString()}`,
        widgets: [],
        theme: "light",
        layout: "grid",
        cols: 12,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          datasetId: dataset?.id,
          source: "manual",
          version: 1,
        },
      };
      store.setConfig(config);
      return config.id;
    },
    [store, dataset]
  );

  const generateDashboard = useCallback(
    async (): Promise<LLMGenerateResponse> => {
      if (!dataset) throw new Error("No dataset loaded");

      const request: LLMGenerateRequest = {
        columns: dataset.columns,
        sampleRows: dataset.rows.slice(0, 5),
        summary: dataset.summary,
        rowCount: dataset.rowCount,
      };

      const response = await fetch("/api/llm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Failed to generate dashboard");
      }

      const result: LLMGenerateResponse = await response.json();

      // The API now returns a fully-formed DashboardConfig under `config`
      store.setConfig(result.config);
      return result;
    },
    [dataset, store]
  );

  const canUndo = store.historyIndex > 0;
  const canRedo = store.historyIndex < store.history.length - 1;

  return {
    config: store.config,
    widgets: store.config?.widgets ?? [],
    activeWidgetId: store.activeWidgetId,
    activeWidget: store.config?.widgets.find(
      (w) => w.id === store.activeWidgetId
    ),
    canUndo,
    canRedo,

    createDashboard,
    generateDashboard,
    addWidget: store.addWidget,
    updateWidget: store.updateWidget,
    removeWidget: store.removeWidget,
    duplicateWidget: store.duplicateWidget,
    updateLayout: store.updateLayout,
    setActiveWidget: store.setActiveWidget,
    undo: store.undo,
    redo: store.redo,
    reset: store.reset,
  };
}
