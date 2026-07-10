"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { useDataStore } from "@/stores/data-store";

export function WidgetEditor() {
  const { activeWidget, updateWidget, setActiveWidget } =
    useDashboard();
  const columns = useDataStore((s) => s.dataset?.columns ?? []);

  if (!activeWidget) return null;

  const mappings = activeWidget.data.mappings;
  const values = (mappings.values ?? []).map(
    (v: string | { field: string }) =>
      typeof v === "string" ? v : v.field
  );

  const handleChange = (field: string, value: unknown) => {
    if (field.startsWith("data.mappings.")) {
      const key = field.replace("data.mappings.", "");
      updateWidget(activeWidget.id, {
        data: {
          ...activeWidget.data,
          mappings: {
            ...activeWidget.data.mappings,
            [key]: value,
          },
        },
      });
    } else if (field === "aggregation") {
      updateWidget(activeWidget.id, {
        data: {
          ...activeWidget.data,
          transforms: {
            ...(activeWidget.data.transforms ?? { aggregation: "none" }),
            aggregation: value as any,
          },
        },
      });
    } else if (field.startsWith("visualization.")) {
      const key = field.replace("visualization.", "");
      updateWidget(activeWidget.id, {
        visualization: {
          ...(activeWidget.visualization as Record<string, unknown>),
          [key]: value,
        },
      });
    } else {
      updateWidget(activeWidget.id, { [field]: value });
    }
  };

  return (
    <div className="flex h-full flex-col border-l bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Widget Settings</h3>
        <button
          onClick={() => setActiveWidget(null)}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Title
            </label>
            <input
              value={activeWidget.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Widget Type
            </label>
            <select
              value={activeWidget.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {["bar", "line", "pie", "area", "kpi", "table"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t === "kpi" ? "KPI" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                )
              )}
            </select>
          </div>

          {activeWidget.type !== "kpi" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Category (X-axis)
              </label>
              <select
                value={mappings.category ?? ""}
                onChange={(e) =>
                  handleChange("data.mappings.category", e.target.value)
                }
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {columns.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Values
            </label>
            <div className="mt-1 space-y-1">
              {columns
                .filter((c) => c.type === "number")
                .map((col) => (
                  <label
                    key={col.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={values.includes(col.name)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...values, col.name]
                          : values.filter((v: string) => v !== col.name);
                        handleChange("data.mappings.values", next);
                      }}
                      className="rounded"
                    />
                    {col.name}
                  </label>
                ))}
            </div>
          </div>

          {activeWidget.type === "kpi" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Aggregation
              </label>
              <select
                value={
                  activeWidget.data.transforms?.aggregation ?? "count"
                }
                  onChange={(e) =>
                    handleChange("aggregation", e.target.value as any)
                  }
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {["sum", "avg", "count", "min", "max"].map((a) => (
                  <option key={a} value={a}>
                    {a.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeWidget.type === "bar" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Bar Variant
              </label>
              <select
                value={
                  (
                    activeWidget.visualization as Record<string, unknown>
                  )?.variant as string ?? "grouped"
                }
                onChange={(e) =>
                  handleChange("visualization.variant", e.target.value)
                }
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="grouped">Grouped</option>
                <option value="stacked">Stacked</option>
                <option value="stacked_percent">Stacked %</option>
              </select>
            </div>
          )}

          {activeWidget.type === "pie" && (
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={
                    (
                      activeWidget.visualization as Record<string, unknown>
                    )?.donut as boolean ?? false
                  }
                  onChange={(e) =>
                    handleChange(
                      "visualization.donut",
                      e.target.checked
                    )
                  }
                  className="rounded"
                />
                Donut style
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
