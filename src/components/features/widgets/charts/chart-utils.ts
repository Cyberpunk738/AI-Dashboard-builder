import { useMemo } from "react";
import type { WidgetConfig } from "@/types/dashboard";

export const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export function getValues(mappings: { values: unknown }): string[] {
  if (!Array.isArray(mappings.values)) return [];
  return (mappings.values as Array<string | { field: string }>).map((v) =>
    typeof v === "string" ? v : v.field
  );
}

export function useChartData(
  data: Record<string, unknown>[],
  category?: string,
  values: string[] = []
) {
  const valuesKey = values.join(",");
  return useMemo(() => {
    if (!values.length) return [];
    return data.map((row) => {
      const point: Record<string, unknown> = {};
      if (category) {
        const rawCategory = row[category];
        if (typeof rawCategory === "string" && rawCategory.includes(" 00:00:00")) {
          point.name = rawCategory.split(" ")[0];
        } else {
          point.name = String(rawCategory ?? "");
        }
      }
      for (const field of values) {
        const val = Number(row[field]);
        point[field] = isNaN(val) ? row[field] : val;
      }
      return point;
    });
  }, [data, category, valuesKey]);
}

export function useWidgetData(widget: WidgetConfig, datasetRows: Record<string, unknown>[]) {
  const mappings = widget.data.mappings;
  const values = getValues(mappings);
  const chartData = useChartData(datasetRows, mappings.category, values);
  const isEmpty = !values.length || !datasetRows.length;
  return { mappings, values, chartData, isEmpty };
}
