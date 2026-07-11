"use client";

import { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { WidgetProps } from "@/types/dashboard";
import { COLORS, useWidgetData } from "./chart-utils";

function LineChartWidget({ widget, data }: WidgetProps) {
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
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs" tickLine={false} />
        <YAxis className="text-xs" tickLine={false} />
        <Tooltip />
        <Legend />
        {values.map((field, i) => (
          <Line
            key={field}
            type="monotone"
            dataKey={field}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default memo(LineChartWidget, (prev, next) => {
  return prev.widget.id === next.widget.id && prev.data === next.data;
});
