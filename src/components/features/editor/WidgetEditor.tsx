"use client";

import * as Tabs from "@radix-ui/react-tabs";
import {
  Copy,
  Trash2,
  X,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useDataStore } from "@/stores/data-store";
import type { WidgetConfig, WidgetType } from "@/types/dashboard";

const WIDGET_TYPES: { value: WidgetType; label: string }[] = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Pie" },
  { value: "area", label: "Area" },
  { value: "kpi", label: "KPI" },
  { value: "table", label: "Table" },
];

export function WidgetEditor() {
  const {
    activeWidget: unsafeActiveWidget,
    updateWidget,
    removeWidget,
    duplicateWidget,
    setActiveWidget,
  } = useDashboard();
  const columns = useDataStore((s) => s.dataset?.columns ?? []);

  if (!unsafeActiveWidget) return null;
  const widget = unsafeActiveWidget;

  const numericColumns = columns.filter((c) => c.type === "number");
  const allColumns = columns;

  const values = (
    Array.isArray(widget.data.mappings.values)
      ? widget.data.mappings.values
      : []
  ).map((v: string | { field: string }) =>
    typeof v === "string" ? v : v.field
  );

  function patch(field: string, value: unknown) {
    updateWidget(widget.id, { [field]: value } as Partial<WidgetConfig>);
  }

  function patchData(path: string[], value: unknown) {
    const [parent, ...rest] = path;
    if (parent === "mappings") {
      const key = rest[0];
      updateWidget(widget.id, {
        data: {
          ...widget.data,
          mappings: { ...widget.data.mappings, [key]: value },
        },
      } as Partial<WidgetConfig>);
    } else if (parent === "transforms") {
      const key = rest[0];
      updateWidget(widget.id, {
        data: {
          ...widget.data,
          transforms: {
            ...(widget.data.transforms ?? {
              aggregation: "none" as const,
            }),
            [key]: value === "" ? undefined : value,
          },
        },
      } as Partial<WidgetConfig>);
    }
  }

  function patchViz(key: string, value: unknown) {
    updateWidget(widget.id, {
      visualization: {
        ...(widget.visualization as Record<string, unknown>),
        [key]: value,
      },
    } as Partial<WidgetConfig>);
  }

  function patchLayout(key: string, value: number) {
    updateWidget(widget.id, {
      layout: { ...widget.layout, [key]: Math.max(value, 1) },
    } as Partial<WidgetConfig>);
  }

  const handleTypeChange = (newType: WidgetType) => {
    const vizMap: Record<WidgetType, Record<string, unknown>> = {
      bar: { variant: "grouped" },
      line: {},
      pie: {},
      area: {},
      kpi: {},
      table: {},
    };
    patch("type", newType);
    patch("visualization", vizMap[newType]);
  };

  return (
    <div className="flex h-full flex-col border-l bg-card">
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <input
          value={widget.title}
          onChange={(e) => patch("title", e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold outline-none"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => duplicateWidget(widget.id)}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => removeWidget(widget.id)}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveWidget(null)}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────── */}
      <Tabs.Root defaultValue="data" className="flex min-h-0 flex-1 flex-col">
        <Tabs.List className="flex shrink-0 border-b px-2">
          {["data", "style", "layout"].map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className="flex-1 px-3 py-2 text-center text-xs font-medium capitalize text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              {tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* ═══ DATA TAB ═══════════════════════════════ */}
        <Tabs.Content value="data" className="flex-1 overflow-auto p-4">
          <div className="space-y-5">
            {/* ── Widget Type ── */}
            <Section label="Widget Type">
              <select
                value={widget.type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as WidgetType)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {WIDGET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Section>

            {/* ── Category ── */}
            {widget.type !== "kpi" && (
              <Section label="Category (X-axis)">
                <select
                  value={widget.data.mappings.category ?? ""}
                  onChange={(e) =>
                    patchData(["mappings", "category"], e.target.value || undefined)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {allColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </Section>
            )}

            {/* ── Values ── */}
            <Section label="Values">
              <div className="max-h-40 space-y-1 overflow-auto">
                {numericColumns.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No numeric columns found
                  </p>
                )}
                {numericColumns.map((col) => (
                  <label
                    key={col.name}
                    className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={values.includes(col.name)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...values, col.name]
                          : values.filter((v) => v !== col.name);
                        patchData(["mappings", "values"], next);
                      }}
                      className="rounded"
                    />
                    {col.name}
                  </label>
                ))}
              </div>
            </Section>

            {/* ── Group By ── */}
            {widget.type !== "kpi" && widget.type !== "table" && (
              <Section label="Group By">
                <select
                  value={widget.data.mappings.groupBy ?? ""}
                  onChange={(e) =>
                    patchData(["mappings", "groupBy"], e.target.value || undefined)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {allColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </Section>
            )}

            {/* ── Aggregation ── */}
            {(widget.type === "kpi" ||
              widget.data.transforms?.aggregation) && (
              <Section label="Aggregation">
                <select
                  value={
                    widget.data.transforms?.aggregation ?? "none"
                  }
                  onChange={(e) =>
                    patchData(["transforms", "aggregation"], e.target.value)
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {[
                    "none",
                    "sum",
                    "avg",
                    "count",
                    "min",
                    "max",
                    "count_distinct",
                  ].map((a) => (
                    <option key={a} value={a}>
                      {a === "count_distinct"
                        ? "Count Distinct"
                        : a.charAt(0).toUpperCase() + a.slice(1)}
                    </option>
                  ))}
                </select>
              </Section>
            )}

            {/* ── Sort By ── */}
            <Section label="Sort By">
              <div className="flex gap-2">
                <select
                  value={widget.data.transforms?.orderBy ?? ""}
                  onChange={(e) =>
                    patchData(
                      ["transforms", "orderBy"],
                      e.target.value || undefined
                    )
                  }
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {numericColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>
                <select
                  value={
                    widget.data.transforms?.orderDirection ?? "desc"
                  }
                  onChange={(e) =>
                    patchData(["transforms", "orderDirection"], e.target.value)
                  }
                  className="w-20 rounded-md border bg-background px-2 py-2 text-sm"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </Section>

            {/* ── Limit ── */}
            {widget.type === "table" && (
              <Section label="Max Rows">
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={widget.data.transforms?.limit ?? 100}
                  onChange={(e) =>
                    patchData(
                      ["transforms", "limit"],
                      parseInt(e.target.value, 10) || undefined
                    )
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </Section>
            )}

            {/* ── Description ── */}
            <Section label="Description">
              <textarea
                value={widget.description ?? ""}
                onChange={(e) => patch("description", e.target.value || undefined)}
                rows={2}
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Section>
          </div>
        </Tabs.Content>

        {/* ═══ STYLE TAB ═══════════════════════════════ */}
        <Tabs.Content value="style" className="flex-1 overflow-auto p-4">
          <div className="space-y-5">
            <StyleBar widget={widget} onPatchViz={patchViz} />
            <StyleLine widget={widget} onPatchViz={patchViz} />
            <StylePie widget={widget} onPatchViz={patchViz} />
            <StyleArea widget={widget} onPatchViz={patchViz} />
            <StyleKpi widget={widget} onPatchViz={patchViz} />
            <StyleTable widget={widget} onPatchViz={patchViz} />
          </div>
        </Tabs.Content>

        {/* ═══ LAYOUT TAB ═══════════════════════════════ */}
        <Tabs.Content value="layout" className="flex-1 overflow-auto p-4">
          <div className="space-y-5">
            <Section label="Width (columns)">
              <input
                type="number"
                min={1}
                max={12}
                value={widget.layout.w}
                onChange={(e) =>
                  patchLayout("w", parseInt(e.target.value, 10) || 1)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Section>

            <Section label="Height (rows)">
              <input
                type="number"
                min={1}
                max={20}
                value={widget.layout.h}
                onChange={(e) =>
                  patchLayout("h", parseInt(e.target.value, 10) || 1)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Section>

            <Section label="Min Width">
              <input
                type="number"
                min={1}
                max={12}
                value={widget.layout.minW ?? 2}
                onChange={(e) =>
                  patchLayout("minW", parseInt(e.target.value, 10) || 1)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Section>

            <Section label="Min Height">
              <input
                type="number"
                min={1}
                max={20}
                value={widget.layout.minH ?? 2}
                onChange={(e) =>
                  patchLayout("minH", parseInt(e.target.value, 10) || 1)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Section>

            <Separator />

            <Section label="Position">
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>X: {widget.layout.x}</div>
                <div>Y: {widget.layout.y}</div>
              </div>
            </Section>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

// ================================================================
// Sub-components
// ================================================================

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Separator() {
  return <div className="border-t" />;
}

// ── Style sections (each renders only when its type matches) ──

function StyleBar({
  widget,
  onPatchViz,
}: {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}) {
  if (widget.type !== "bar") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <Section label="Bar Variant">
        <select
          value={(viz.variant as string) ?? "grouped"}
          onChange={(e) => onPatchViz("variant", e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="grouped">Grouped</option>
          <option value="stacked">Stacked</option>
          <option value="stacked_percent">Stacked %</option>
        </select>
      </Section>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.horizontal as boolean) ?? false}
          onChange={(e) => onPatchViz("horizontal", e.target.checked)}
          className="rounded"
        />
        Horizontal orientation
      </label>

      <Section label="Border Radius">
        <input
          type="number"
          min={0}
          value={(viz.borderRadius as number) ?? 0}
          onChange={(e) =>
            onPatchViz("borderRadius", parseInt(e.target.value, 10) || 0)
          }
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </Section>
    </>
  );
}

function StyleLine({
  widget,
  onPatchViz,
}: {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}) {
  if (widget.type !== "line") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.smooth as boolean) ?? false}
          onChange={(e) => onPatchViz("smooth", e.target.checked)}
          className="rounded"
        />
        Smooth curves
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.showPoints as boolean) ?? true}
          onChange={(e) => onPatchViz("showPoints", e.target.checked)}
          className="rounded"
        />
        Show data points
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.fillArea as boolean) ?? false}
          onChange={(e) => onPatchViz("fillArea", e.target.checked)}
          className="rounded"
        />
        Fill area below line
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.connectNulls as boolean) ?? false}
          onChange={(e) => onPatchViz("connectNulls", e.target.checked)}
          className="rounded"
        />
        Connect null values
      </label>
    </>
  );
}

function StylePie({
  widget,
  onPatchViz,
}: {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}) {
  if (widget.type !== "pie") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.donut as boolean) ?? false}
          onChange={(e) => onPatchViz("donut", e.target.checked)}
          className="rounded"
        />
        Donut style
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.showLabels as boolean) ?? true}
          onChange={(e) => onPatchViz("showLabels", e.target.checked)}
          className="rounded"
        />
        Show labels
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.showPercentages as boolean) ?? false}
          onChange={(e) => onPatchViz("showPercentages", e.target.checked)}
          className="rounded"
        />
        Show percentages
      </label>
    </>
  );
}

function StyleArea({
  widget,
  onPatchViz,
}: {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}) {
  if (widget.type !== "area") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.stacked as boolean) ?? false}
          onChange={(e) => onPatchViz("stacked", e.target.checked)}
          className="rounded"
        />
        Stacked areas
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.showPoints as boolean) ?? true}
          onChange={(e) => onPatchViz("showPoints", e.target.checked)}
          className="rounded"
        />
        Show data points
      </label>
      <Section label="Fill Opacity">
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={(viz.fillOpacity as number) ?? 0.5}
          onChange={(e) => onPatchViz("fillOpacity", parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-muted-foreground">
          {((viz.fillOpacity as number) ?? 0.5).toFixed(1)}
        </span>
      </Section>
    </>
  );
}

function StyleKpi({
  widget,
  onPatchViz,
}: {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}) {
  if (widget.type !== "kpi") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <Section label="Number Format">
        <select
          value={
            ((viz.format as Record<string, unknown>)?.number as string) ??
            "compact"
          }
          onChange={(e) =>
            onPatchViz("format", { number: e.target.value })
          }
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="number">Plain</option>
          <option value="compact">Compact</option>
          <option value="currency">Currency</option>
          <option value="percentage">Percentage</option>
          <option value="decimal">Decimal</option>
          <option value="abbreviated">Abbreviated</option>
        </select>
      </Section>

      <Section label="Trend Indicator">
        <select
          value={(viz.trend as string) ?? "auto"}
          onChange={(e) => onPatchViz("trend", e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="auto">Auto</option>
          <option value="up">Up (positive)</option>
          <option value="down">Down (negative)</option>
          <option value="neutral">Neutral</option>
        </select>
      </Section>
    </>
  );
}

function StyleTable({
  widget,
  onPatchViz,
}: {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}) {
  if (widget.type !== "table") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.pagination as boolean) ?? true}
          onChange={(e) => onPatchViz("pagination", e.target.checked)}
          className="rounded"
        />
        Enable pagination
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.showSearch as boolean) ?? false}
          onChange={(e) => onPatchViz("showSearch", e.target.checked)}
          className="rounded"
        />
        Show search
      </label>
      {viz.pagination !== false && (
        <Section label="Page Size">
          <input
            type="number"
            min={5}
            max={100}
            value={(viz.pageSize as number) ?? 20}
            onChange={(e) =>
              onPatchViz("pageSize", parseInt(e.target.value, 10) || 20)
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </Section>
      )}
    </>
  );
}
