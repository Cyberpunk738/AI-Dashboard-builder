"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { WidgetProps } from "@/types/dashboard";
import { COLORS, useWidgetData } from "./chart-utils";

export default function AreaChartWidget({ widget, data }: WidgetProps) {
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
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs" tickLine={false} />
        <YAxis className="text-xs" tickLine={false} />
        <Tooltip />
        <Legend />
        {values.map((field, i) => (
          <Area
            key={field}
            type="monotone"
            dataKey={field}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.1}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
