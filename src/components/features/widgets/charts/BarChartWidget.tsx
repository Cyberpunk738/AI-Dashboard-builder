"use client";

import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { WidgetProps } from "@/types/dashboard";
import { COLORS, useWidgetData } from "./chart-utils";

function BarChartWidget({ widget, data }: WidgetProps) {
  const { values, chartData, isEmpty } = useWidgetData(widget, data);

  if (isEmpty) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Map a value column in settings
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs" tickLine={false} />
        <YAxis className="text-xs" tickLine={false} />
        <Tooltip />
        <Legend />
        {values.map((field, i) => (
          <Bar
            key={field}
            dataKey={field}
            fill={COLORS[i % COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(BarChartWidget, (prev, next) => {
  return prev.widget.id === next.widget.id && prev.data === next.data;
});
