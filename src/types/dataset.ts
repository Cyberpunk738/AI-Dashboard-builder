export type ColumnType = "number" | "string" | "date" | "boolean";

export interface Column {
  name: string;
  type: ColumnType;
  nullable: boolean;
}

export interface ColumnSummary {
  name: string;
  type: ColumnType;
  distinct: number;
  nullCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  sampleValues: unknown[];
}

export interface Dataset {
  id: string;
  name: string;
  fileName: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  rowCount: number;
  summary: ColumnSummary[];
  uploadedAt: string;
}

export interface DataSource {
  id: string;
  type: "csv" | "xlsx" | "api";
  label: string;
  dataset: Dataset;
}

export type AggregationType = "sum" | "avg" | "count" | "count_distinct" | "min" | "max" | "none";
