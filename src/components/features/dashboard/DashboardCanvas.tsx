"use client";

import { useCallback, useState } from "react";
import { Wand2, Plus, Undo2, LayoutDashboard, Loader2 } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useDataStore } from "@/stores/data-store";
import { DashboardGrid } from "./DashboardGrid";
import { WidgetRenderer } from "@/components/features/widgets/WidgetRenderer";
import { EmptyState } from "@/components/shared/EmptyState";
import type { GridLayout } from "@/types/dashboard";

const WIDGET_TYPES = ["bar", "line", "pie", "area", "kpi", "table"] as const;

export function DashboardCanvas() {
  const {
    config,
    widgets,
    activeWidgetId,
    generateDashboard,
    addWidget,
    removeWidget,
    updateLayout,
    setActiveWidget,
    undo,
    canUndo,
  } = useDashboard();

  const dataset = useDataStore((s) => s.dataset);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!dataset) return;
    setIsGenerating(true);
    try {
      await generateDashboard();
    } catch {
      // Error handled by hook
    } finally {
      setIsGenerating(false);
    }
  }, [dataset, generateDashboard]);

  const handleLayoutChange = useCallback(
    (layouts: GridLayout[]) => {
      updateLayout(layouts);
    },
    [updateLayout]
  );

  const handleAddWidget = useCallback(
    (type: (typeof WIDGET_TYPES)[number]) => {
      const maxY = widgets.reduce(
        (max, w) => Math.max(max, w.layout.y + w.layout.h),
        0
      );
      addWidget(type, {
        layout: { x: 0, y: maxY, w: 4, h: 3 },
      });
      setShowAddMenu(false);
    },
    [widgets, addWidget]
  );

  if (!config) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
        <EmptyState
          icon={LayoutDashboard}
          title="No dashboard yet"
          description="Generate one with AI from your data, or add widgets manually"
          action={
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={!dataset || isGenerating}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {isGenerating
                  ? "Generating..."
                  : "Generate with AI"}
              </button>
              <button
                onClick={() => handleAddWidget("kpi")}
                disabled={!dataset}
                className="inline-flex items-center gap-2 rounded-lg border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Widget
              </button>
            </div>
          }
        />
        {!dataset && (
          <p className="text-sm text-muted-foreground">
            Upload a CSV or Excel file to get started
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold">{config.title}</h2>
            <p className="text-xs text-muted-foreground">
              {widgets.length} widget{widgets.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="rounded-lg border bg-card p-2 text-sm hover:bg-muted disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              Widget
            </button>
            {showAddMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border bg-card py-1 shadow-lg">
                {WIDGET_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleAddWidget(type)}
                    className="w-full px-4 py-2 text-left text-sm capitalize hover:bg-muted"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!dataset || isGenerating}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Regenerate"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <DashboardGrid
          widgets={widgets}
          activeWidgetId={activeWidgetId}
          onLayoutChange={handleLayoutChange}
          onSelect={setActiveWidget}
          onRemove={removeWidget}
          renderWidget={(widget) => <WidgetRenderer widget={widget} />}
        />
      </div>
    </div>
  );
}
