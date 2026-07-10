"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { WidgetProps } from "@/types/dashboard";
import { COLORS, useWidgetData } from "./chart-utils";

export default function PieChartWidget({ widget, data }: WidgetProps) {
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
      <PieChart>
        <Pie
          data={chartData}
          dataKey={values[0]}
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
