"use client";

import * as Tabs from "@radix-ui/react-tabs";
import {
  Copy,
  Trash2,
  X,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useDataStore } from "@/stores/data-store";
import { Section, Separator } from "./sections/shared";
import { StyleBar } from "./sections/bar-style";
import { StyleLine } from "./sections/line-style";
import { StylePie } from "./sections/pie-style";
import { StyleArea } from "./sections/area-style";
import { StyleKpi } from "./sections/kpi-style";
import { StyleTable } from "./sections/table-style";
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


