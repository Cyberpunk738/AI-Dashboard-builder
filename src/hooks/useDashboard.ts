"use client";

import { useCallback, useMemo } from "react";
import { nanoid } from "nanoid";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useDataStore } from "@/stores/data-store";
import type { DashboardConfig } from "@/types/dashboard";
import type { LLMGenerateRequest, LLMGenerateResponse } from "@/types/ai";

export function useDashboard() {
  const dataset = useDataStore((s) => s.dataset);

  const config = useDashboardStore((s) => s.config);
  const activeWidgetId = useDashboardStore((s) => s.activeWidgetId);
  const historyIndex = useDashboardStore((s) => s.historyIndex);
  const historyLength = useDashboardStore((s) => s.history.length);

  const activeWidget = useMemo(
    () => config?.widgets.find((w) => w.id === activeWidgetId) ?? null,
    [config, activeWidgetId]
  );

  // Stable store action references — these never change
  const setConfig = useDashboardStore.getState().setConfig;
  const addWidget = useDashboardStore.getState().addWidget;
  const updateWidget = useDashboardStore.getState().updateWidget;
  const removeWidget = useDashboardStore.getState().removeWidget;
  const duplicateWidget = useDashboardStore.getState().duplicateWidget;
  const updateLayout = useDashboardStore.getState().updateLayout;
  const setActiveWidgetFn = useDashboardStore.getState().setActiveWidget;
  const undo = useDashboardStore.getState().undo;
  const redo = useDashboardStore.getState().redo;
  const reset = useDashboardStore.getState().reset;

  const createDashboard = useCallback(
    (title?: string) => {
      const dashboardConfig: DashboardConfig = {
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
      setConfig(dashboardConfig);
      return dashboardConfig.id;
    },
    [dataset, setConfig]
  );

  const generateDashboard = useCallback(
    async (): Promise<LLMGenerateResponse> => {
      if (!dataset) throw new Error("No dataset loaded");

      const request: LLMGenerateRequest = {
        columns: dataset.columns,
        sampleRows: dataset.rows.slice(0, 2),
        summary: dataset.summary,
        rowCount: dataset.rowCount,
      };

      const response = await fetch("/api/llm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let detail = "";
        try {
          const parsed = JSON.parse(errorBody);
          detail = parsed.error || parsed.details || errorBody;
        } catch {
          detail = errorBody;
        }
        throw new Error(`Failed to generate dashboard: ${detail}`);
      }

      const result: LLMGenerateResponse = await response.json();

      setConfig(result.config);
      return result;
    },
    [dataset, setConfig]
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  const widgets = useMemo(() => config?.widgets ?? [], [config]);

  return {
    config,
    widgets,
    activeWidgetId,
    activeWidget,
    canUndo,
    canRedo,

    createDashboard,
    generateDashboard,
    addWidget,
    updateWidget,
    removeWidget,
    duplicateWidget,
    updateLayout,
    setActiveWidget: setActiveWidgetFn,
    undo,
    redo,
    reset,
  };
}
