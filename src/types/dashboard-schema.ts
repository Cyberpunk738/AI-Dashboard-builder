// ============================================================
// Dashboard Schema — complete type system for dynamic rendering
// ============================================================

import type { AggregationType } from "./dataset";

// --- Layout ---

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  static?: boolean;
}

export interface GridLayout extends WidgetLayout {
  i: string;
}

// --- Filters ---

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal"
  | "between"
  | "not_between"
  | "is_empty"
  | "is_not_empty"
  | "in"
  | "not_in";

export interface WidgetFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
  value2?: unknown;
}

// --- Sorting ---

export type SortDirection = "asc" | "desc";

export interface WidgetSorting {
  field: string;
  direction: SortDirection;
  priority?: number;
}

// --- Data Mapping ---

export interface ChartSeries {
  field: string;
  label?: string;
  color?: string;
  aggregation?: AggregationType;
  axis?: "left" | "right";
  type?: "bar" | "line";
}

export interface DataMapping {
  category?: string;
  values: string[] | ChartSeries[];
  groupBy?: string;
  labelField?: string;
  comparisonField?: string;
  comparisonType?: "previous_period" | "target" | "absolute" | "percentage";
}

// --- Transforms ---

export interface DataTransform {
  aggregation: AggregationType;
  groupBy?: string[];
  orderBy?: string;
  orderDirection?: SortDirection;
  limit?: number;
  offset?: number;
  rollingWindow?: number;
}

// --- Formatting ---

export type NumberFormatType =
  | "number"
  | "currency"
  | "percentage"
  | "decimal"
  | "compact"
  | "abbreviated";

export type DateFormatType =
  | "date_short"
  | "date_long"
  | "date_time"
  | "time"
  | "month"
  | "quarter"
  | "year"
  | "iso";

export interface ValueFormat {
  number?: NumberFormatType;
  date?: DateFormatType;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  currency?: string;
  locale?: string;
  abbreviate?: boolean;
}

// --- Axis ---

export interface AxisConfig {
  title?: string;
  visible?: boolean;
  min?: number | "auto";
  max?: number | "auto";
  format?: ValueFormat;
  tickCount?: number;
  tickFormatter?: string;
}

// --- Visualization Options ---

export interface LegendConfig {
  show?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  fontSize?: number;
}

interface ChartBase {
  legend?: LegendConfig;
  colors?: string[];
  columnColors?: Record<string, string>;
  axes?: {
    x?: AxisConfig;
    y?: AxisConfig;
    y2?: AxisConfig;
  };
  showGrid?: boolean;
  gridColor?: string;
}

export interface BarVisualization extends ChartBase {
  variant: "grouped" | "stacked" | "stacked_percent";
  horizontal?: boolean;
  barThickness?: number;
  maxBarThickness?: number;
  borderRadius?: number;
}

export interface LineVisualization extends ChartBase {
  smooth?: boolean;
  showPoints?: boolean;
  pointSize?: number;
  fillArea?: boolean;
  fillOpacity?: number;
  lineWidth?: number;
  connectNulls?: boolean;
  dashed?: string[];
}

export interface PieVisualization extends ChartBase {
  donut?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  labelPosition?: "inside" | "outside";
  showPercentages?: boolean;
}

export interface AreaVisualization extends ChartBase {
  stacked?: boolean;
  fillOpacity?: number;
  showPoints?: boolean;
}

export interface TableColumnConfig {
  field: string;
  header?: string;
  format?: ValueFormat;
  width?: number | string;
  align?: "left" | "center" | "right";
  visible?: boolean;
  sortable?: boolean;
  pin?: "left" | "right";
}

export interface TableVisualization {
  columns?: TableColumnConfig[];
  pagination?: boolean;
  pageSize?: number;
  showSearch?: boolean;
  rowStriping?: boolean;
  allowSelection?: boolean;
  allowExport?: boolean;
  zebra?: boolean;
}

export interface Threshold {
  value: number;
  color: string;
  label?: string;
  operator?: "gt" | "gte" | "lt" | "lte" | "eq" | "between";
  value2?: number;
}

export interface KpiVisualization {
  format?: ValueFormat;
  comparison?: {
    show?: boolean;
    label?: string;
    field?: string;
    type?: "previous_period" | "target" | "absolute" | "percentage";
    direction?: "up_is_good" | "down_is_good";
  };
  thresholds?: Threshold[];
  icon?: string;
  trend?: "up" | "down" | "neutral" | "auto";
  sparkline?: {
    show: boolean;
    field: string;
    color?: string;
    fillColor?: string;
  };
  color?: string;
}

// --- Widget Config ---

export type WidgetType = "bar" | "line" | "pie" | "area" | "table" | "kpi";

export type WidgetVisualization =
  | BarVisualization
  | LineVisualization
  | PieVisualization
  | AreaVisualization
  | TableVisualization
  | KpiVisualization;

export interface WidgetDataConfig {
  mappings: DataMapping;
  transforms?: DataTransform;
  filters?: WidgetFilter[];
  sorting?: WidgetSorting[];
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  layout: WidgetLayout;
  data: WidgetDataConfig;
  visualization: WidgetVisualization;
}

// --- Dashboard ---

export interface DashboardVariable {
  id: string;
  name: string;
  type: "string" | "number" | "date" | "boolean";
  defaultValue?: unknown;
  options?: { label: string; value: unknown }[];
}

export interface DashboardMetadata {
  createdAt: string;
  updatedAt: string;
  datasetId?: string;
  createdBy?: string;
  tags?: string[];
  source?: "ai_generated" | "manual" | "imported";
  version?: number;
}

export interface DashboardConfig {
  id: string;
  title: string;
  description?: string;
  schemaVersion: number;
  widgets: WidgetConfig[];
  variables?: DashboardVariable[];
  theme?: "light" | "dark" | "auto";
  layout?: "grid";
  cols?: number;
  metadata?: DashboardMetadata;
}

// --- Runtime Props ---

export interface WidgetProps {
  widget: WidgetConfig;
  data: Record<string, unknown>[];
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}

// --- Type Helpers ---

export type WidgetTypeMap = {
  bar: BarVisualization;
  line: LineVisualization;
  pie: PieVisualization;
  area: AreaVisualization;
  table: TableVisualization;
  kpi: KpiVisualization;
};

export function getVisualization<T extends WidgetType>(
  widget: WidgetConfig
): WidgetTypeMap[T] {
  return widget.visualization as WidgetTypeMap[T];
}

export function getDefaultLayout(w: number = 4, h: number = 3): WidgetLayout {
  return { x: 0, y: 0, w, h };
}

export const SUPPORTED_WIDGET_TYPES: WidgetType[] = [
  "bar", "line", "pie", "area", "table", "kpi",
];
