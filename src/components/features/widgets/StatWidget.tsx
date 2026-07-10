"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { WidgetProps } from "@/types/dashboard";

export default function StatWidget({ widget, data }: WidgetProps) {
  const mappings = widget.data.mappings;
  const values =
    mappings.values?.map((v: string | { field: string }) =>
      typeof v === "string" ? v : v.field
    ) ?? [];
  const field = values[0];
  const transforms = widget.data.transforms;
  const aggregation = transforms?.aggregation;

  const viz = widget.visualization as Record<string, unknown>;

  const { value, change } = useMemo(() => {
    if (!field || !data.length) return { value: null, change: null };

    const numbers = data
      .map((row) => Number(row[field]))
      .filter((n) => !isNaN(n));

    if (!numbers.length) return { value: null, change: null };

    let result: number;
    switch (aggregation) {
      case "sum":
        result = numbers.reduce((a, b) => a + b, 0);
        break;
      case "avg":
        result = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        break;
      case "min":
        result = Math.min(...numbers);
        break;
      case "max":
        result = Math.max(...numbers);
        break;
      case "count":
      default:
        result = numbers.length;
        break;
    }

    const mid = Math.floor(numbers.length / 2);
    const firstHalf = numbers.slice(0, mid);
    const secondHalf = numbers.slice(mid);
    const firstAvg =
      firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
    const secondAvg =
      secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
    const trendChange = firstAvg
      ? ((secondAvg - firstAvg) / firstAvg) * 100
      : 0;

    return { value: result, change: trendChange };
  }, [data, field, aggregation]);

  const formatNumber = (n: number): string => {
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const trendIcon =
    change !== null && change !== 0 ? (
      change > 0 ? (
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-500" />
      )
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" />
    );

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground">{widget.title}</p>
      {value !== null ? (
        <>
          <p className="text-3xl font-bold tracking-tight">
            {formatNumber(value)}
          </p>
          {change !== null && (
            <div className="flex items-center gap-1 text-sm">
              {trendIcon}
              <span
                className={
                  change > 0 ? "text-emerald-500" : "text-red-500"
                }
              >
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs baseline</span>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Map a numeric column in settings
        </p>
      )}
    </div>
  );
}
