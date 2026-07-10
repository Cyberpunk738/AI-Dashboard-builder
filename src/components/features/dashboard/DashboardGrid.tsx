"use client";

import { useCallback } from "react";
import GridLayout from "react-grid-layout";
import { GripHorizontal, Settings, Trash2 } from "lucide-react";
import type { WidgetConfig, GridLayout as GridLayoutType } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
  widgets: WidgetConfig[];
  activeWidgetId: string | null;
  onLayoutChange: (layouts: GridLayoutType[]) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  renderWidget: (widget: WidgetConfig) => React.ReactNode;
}

const COLS = 12;
const ROW_HEIGHT = 100;
const MARGIN: [number, number] = [16, 16];

export function DashboardGrid({
  widgets,
  activeWidgetId,
  onLayoutChange,
  onSelect,
  onRemove,
  renderWidget,
}: DashboardGridProps) {
  const layout = widgets.map((w) => ({
    i: w.id,
    x: w.layout.x,
    y: w.layout.y,
    w: w.layout.w,
    h: w.layout.h,
    minW: w.layout.minW ?? 2,
    minH: w.layout.minH ?? 2,
  }));

  const handleLayoutChange = useCallback(
    (newLayout: GridLayoutType[]) => {
      onLayoutChange([...newLayout]);
    },
    [onLayoutChange]
  );

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={COLS}
      rowHeight={ROW_HEIGHT}
      margin={MARGIN}
      containerPadding={[0, 0]}
      isDraggable
      isResizable
      compactType="vertical"
      preventCollision={false}
      draggableHandle=".drag-handle"
      onLayoutChange={handleLayoutChange}
    >
      {widgets.map((widget) => (
        <div
          key={widget.id}
          onClick={() => onSelect(widget.id)}
          className={cn(
            "group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
            widget.id === activeWidgetId && "ring-2 ring-primary"
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="drag-handle cursor-grab rounded p-0.5 text-muted-foreground hover:bg-muted active:cursor-grabbing">
                <GripHorizontal className="h-4 w-4" />
              </div>
              <span className="select-none truncate text-sm font-medium">
                {widget.title}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(widget.id);
                }}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
                title="Edit"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(widget.id);
                }}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-4">
            {renderWidget(widget)}
          </div>
        </div>
      ))}
    </GridLayout>
  );
}
