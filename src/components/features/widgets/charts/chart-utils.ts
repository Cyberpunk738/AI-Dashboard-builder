import { useMemo } from "react";
import type { WidgetConfig } from "@/types/dashboard";

export const COLORS = [
  "hsl(var(--primary))",
  "hsl(210, 100%, 60%)",
  "hsl(160, 60%, 50%)",
  "hsl(30, 90%, 55%)",
  "hsl(330, 70%, 55%)",
  "hsl(270, 60%, 60%)",
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
      if (category) point.name = row[category];
      for (const field of values) {
        point[field] = row[field];
      }
      return point;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, category, valuesKey]);
}

export function useWidgetData(widget: WidgetConfig, datasetRows: Record<string, unknown>[]) {
  const mappings = widget.data.mappings;
  const values = getValues(mappings);
  const chartData = useChartData(datasetRows, mappings.category, values);
  const isEmpty = !values.length || !datasetRows.length;
  return { mappings, values, chartData, isEmpty };
}
