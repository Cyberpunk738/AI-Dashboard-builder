import { z } from "zod";

// --- Layout ---

export const WidgetLayoutSchema = z.object({
  x: z.number().int().min(0).default(0),
  y: z.number().int().min(0).default(0),
  w: z.number().int().min(1).max(24).default(4),
  h: z.number().int().min(1).default(3),
  minW: z.number().int().min(1).optional(),
  minH: z.number().int().min(1).optional(),
  static: z.boolean().optional(),
});

// --- Filters ---

export const FilterOperatorSchema = z.enum([
  "equals",
  "not_equals",
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
  "greater_than",
  "greater_than_or_equal",
  "less_than",
  "less_than_or_equal",
  "between",
  "not_between",
  "is_empty",
  "is_not_empty",
  "in",
  "not_in",
]);

export const WidgetFilterSchema = z.object({
  id: z.string().min(1),
  field: z.string().min(1),
  operator: FilterOperatorSchema,
  value: z.unknown(),
  value2: z.unknown().optional(),
});

// --- Sorting ---

export const SortDirectionSchema = z.enum(["asc", "desc"]);

export const WidgetSortingSchema = z.object({
  field: z.string().min(1),
  direction: SortDirectionSchema,
  priority: z.number().int().min(0).optional(),
});

// --- Aggregation ---

export const AggregationTypeSchema = z.enum([
  "sum",
  "avg",
  "count",
  "count_distinct",
  "min",
  "max",
  "none",
]);

// --- Chart Series ---

export const ChartSeriesSchema = z.object({
  field: z.string().min(1),
  label: z.string().optional(),
  color: z.string().optional(),
  aggregation: AggregationTypeSchema.optional(),
  axis: z.enum(["left", "right"]).optional(),
  type: z.enum(["bar", "line"]).optional(),
});

export const DataMappingSchema = z.object({
  category: z.string().optional(),
  values: z.union([z.array(z.string()), z.array(ChartSeriesSchema)]),
  groupBy: z.string().optional(),
  labelField: z.string().optional(),
  comparisonField: z.string().optional(),
  comparisonType: z
    .enum(["previous_period", "target", "absolute", "percentage"])
    .optional(),
});

// --- Transforms ---

export const DataTransformSchema = z.object({
  aggregation: AggregationTypeSchema,
  groupBy: z.array(z.string()).optional(),
  orderBy: z.string().optional(),
  orderDirection: SortDirectionSchema.optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
  rollingWindow: z.number().int().positive().optional(),
});

// --- Formatting ---

export const ValueFormatSchema = z.object({
  number: z
    .enum(["number", "currency", "percentage", "decimal", "compact", "abbreviated"])
    .optional(),
  date: z
    .enum(["date_short", "date_long", "date_time", "time", "month", "quarter", "year", "iso"])
    .optional(),
  decimals: z.number().int().min(0).max(10).optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  currency: z.string().optional(),
  locale: z.string().optional(),
  abbreviate: z.boolean().optional(),
});

// --- Axis ---

export const AxisConfigSchema = z.object({
  title: z.string().optional(),
  visible: z.boolean().optional(),
  min: z.union([z.number(), z.literal("auto")]).optional(),
  max: z.union([z.number(), z.literal("auto")]).optional(),
  format: ValueFormatSchema.optional(),
  tickCount: z.number().int().positive().optional(),
  tickFormatter: z.string().optional(),
});

// --- Legend ---

export const LegendConfigSchema = z.object({
  show: z.boolean().optional(),
  position: z.enum(["top", "bottom", "left", "right"]).optional(),
  align: z.enum(["start", "center", "end"]).optional(),
  fontSize: z.number().int().positive().optional(),
});

// --- Axis Set ---

const AxesSchema = z.object({
  x: AxisConfigSchema.optional(),
  y: AxisConfigSchema.optional(),
  y2: AxisConfigSchema.optional(),
});

// --- Chart Base ---

const ChartBaseSchema = z.object({
  legend: LegendConfigSchema.optional(),
  colors: z.array(z.string()).optional(),
  columnColors: z.record(z.string()).optional(),
  axes: AxesSchema.optional(),
  showGrid: z.boolean().optional(),
  gridColor: z.string().optional(),
});

// --- Bar ---

export const BarVisualizationSchema = ChartBaseSchema.extend({
  variant: z.enum(["grouped", "stacked", "stacked_percent"]).default("grouped"),
  horizontal: z.boolean().optional(),
  barThickness: z.number().int().positive().optional(),
  maxBarThickness: z.number().int().positive().optional(),
  borderRadius: z.number().min(0).optional(),
});

// --- Line ---

export const LineVisualizationSchema = ChartBaseSchema.extend({
  smooth: z.boolean().optional(),
  showPoints: z.boolean().optional(),
  pointSize: z.number().int().positive().optional(),
  fillArea: z.boolean().optional(),
  fillOpacity: z.number().min(0).max(1).optional(),
  lineWidth: z.number().positive().optional(),
  connectNulls: z.boolean().optional(),
  dashed: z.array(z.string()).optional(),
});

// --- Pie ---

export const PieVisualizationSchema = ChartBaseSchema.extend({
  donut: z.boolean().optional(),
  innerRadius: z.number().min(0).optional(),
  outerRadius: z.number().min(0).optional(),
  showLabels: z.boolean().optional(),
  labelPosition: z.enum(["inside", "outside"]).optional(),
  showPercentages: z.boolean().optional(),
});

// --- Area ---

export const AreaVisualizationSchema = ChartBaseSchema.extend({
  stacked: z.boolean().optional(),
  fillOpacity: z.number().min(0).max(1).optional(),
  showPoints: z.boolean().optional(),
});

// --- Table Column ---

export const TableColumnConfigSchema = z.object({
  field: z.string().min(1),
  header: z.string().optional(),
  format: ValueFormatSchema.optional(),
  width: z.union([z.number(), z.string()]).optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  visible: z.boolean().optional(),
  sortable: z.boolean().optional(),
  pin: z.enum(["left", "right"]).optional(),
});

// --- Table ---

export const TableVisualizationSchema = z.object({
  columns: z.array(TableColumnConfigSchema).optional(),
  pagination: z.boolean().optional(),
  pageSize: z.number().int().positive().optional(),
  showSearch: z.boolean().optional(),
  rowStriping: z.boolean().optional(),
  allowSelection: z.boolean().optional(),
  allowExport: z.boolean().optional(),
  zebra: z.boolean().optional(),
});

// --- Threshold ---

export const ThresholdSchema = z.object({
  value: z.number(),
  color: z.string(),
  label: z.string().optional(),
  operator: z
    .enum(["gt", "gte", "lt", "lte", "eq", "between"])
    .optional(),
  value2: z.number().optional(),
});

// --- KPI ---

export const KpiVisualizationSchema = z.object({
  format: ValueFormatSchema.optional(),
  comparison: z
    .object({
      show: z.boolean().optional(),
      label: z.string().optional(),
      field: z.string().optional(),
      type: z
        .enum(["previous_period", "target", "absolute", "percentage"])
        .optional(),
      direction: z.enum(["up_is_good", "down_is_good"]).optional(),
    })
    .optional(),
  thresholds: z.array(ThresholdSchema).optional(),
  icon: z.string().optional(),
  trend: z.enum(["up", "down", "neutral", "auto"]).optional(),
  sparkline: z
    .object({
      show: z.boolean(),
      field: z.string(),
      color: z.string().optional(),
      fillColor: z.string().optional(),
    })
    .optional(),
  color: z.string().optional(),
});

// --- Widget discriminated union ---

export const WidgetConfigSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    type: z.literal("bar"),
    title: z.string().min(1),
    description: z.string().optional(),
    layout: WidgetLayoutSchema,
    data: z.object({
      mappings: DataMappingSchema,
      transforms: DataTransformSchema.optional(),
      filters: z.array(WidgetFilterSchema).optional(),
      sorting: z.array(WidgetSortingSchema).optional(),
    }),
    visualization: BarVisualizationSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("line"),
    title: z.string().min(1),
    description: z.string().optional(),
    layout: WidgetLayoutSchema,
    data: z.object({
      mappings: DataMappingSchema,
      transforms: DataTransformSchema.optional(),
      filters: z.array(WidgetFilterSchema).optional(),
      sorting: z.array(WidgetSortingSchema).optional(),
    }),
    visualization: LineVisualizationSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("pie"),
    title: z.string().min(1),
    description: z.string().optional(),
    layout: WidgetLayoutSchema,
    data: z.object({
      mappings: DataMappingSchema,
      transforms: DataTransformSchema.optional(),
      filters: z.array(WidgetFilterSchema).optional(),
      sorting: z.array(WidgetSortingSchema).optional(),
    }),
    visualization: PieVisualizationSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("area"),
    title: z.string().min(1),
    description: z.string().optional(),
    layout: WidgetLayoutSchema,
    data: z.object({
      mappings: DataMappingSchema,
      transforms: DataTransformSchema.optional(),
      filters: z.array(WidgetFilterSchema).optional(),
      sorting: z.array(WidgetSortingSchema).optional(),
    }),
    visualization: AreaVisualizationSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("table"),
    title: z.string().min(1),
    description: z.string().optional(),
    layout: WidgetLayoutSchema,
    data: z.object({
      mappings: DataMappingSchema,
      transforms: DataTransformSchema.optional(),
      filters: z.array(WidgetFilterSchema).optional(),
      sorting: z.array(WidgetSortingSchema).optional(),
    }),
    visualization: TableVisualizationSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("kpi"),
    title: z.string().min(1),
    description: z.string().optional(),
    layout: WidgetLayoutSchema,
    data: z.object({
      mappings: DataMappingSchema,
      transforms: DataTransformSchema.optional(),
      filters: z.array(WidgetFilterSchema).optional(),
      sorting: z.array(WidgetSortingSchema).optional(),
    }),
    visualization: KpiVisualizationSchema,
  }),
]);

// --- Dashboard ---

export const DashboardVariableSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["string", "number", "date", "boolean"]),
  defaultValue: z.unknown().optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.unknown(),
      })
    )
    .optional(),
});

export const DashboardMetadataSchema = z.object({
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  datasetId: z.string().optional(),
  createdBy: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.enum(["ai_generated", "manual", "imported"]).optional(),
  version: z.number().int().positive().optional(),
});

export const DashboardConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  schemaVersion: z.number().int().positive().default(1),
  widgets: z.array(WidgetConfigSchema).min(0),
  variables: z.array(DashboardVariableSchema).optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
  layout: z.enum(["grid"]).optional(),
  cols: z.number().int().min(1).max(24).optional(),
  metadata: DashboardMetadataSchema.optional(),
});

// ============================================================
// Validation Result
// ============================================================

export interface DashboardValidationResult {
  success: boolean;
  data?: z.infer<typeof DashboardConfigSchema>;
  errors?: Array<{
    path: string;
    message: string;
    code: string;
  }>;
  warnings?: string[];
}

function flattenZodErrors(error: z.ZodError): Array<{
  path: string;
  message: string;
  code: string;
}> {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
}

export function validateDashboardConfig(
  input: unknown
): DashboardValidationResult {
  const result = DashboardConfigSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      warnings: [],
    };
  }

  return {
    success: false,
    errors: flattenZodErrors(result.error),
  };
}

export function validateWidgetConfig(
  input: unknown
): {
  success: boolean;
  data?: z.infer<typeof WidgetConfigSchema>;
  errors?: Array<{ path: string; message: string; code: string }>;
} {
  const result = WidgetConfigSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: flattenZodErrors(result.error),
  };
}

// ============================================================
// Default factories
// ============================================================

export function createDefaultWidgetConfig(
  type: z.infer<typeof WidgetConfigSchema>["type"],
  overrides?: Partial<z.infer<typeof WidgetConfigSchema>>
): z.infer<typeof WidgetConfigSchema> {
  const base = {
    id: crypto.randomUUID?.() ?? `${type}_${Date.now()}`,
    type,
    title: `New ${type} chart`,
    layout: { x: 0, y: 0, w: 4, h: 3 },
    data: {
      mappings: { values: [] },
    },
    visualization: {},
  };

  switch (type) {
    case "bar":
      return { ...base, visualization: { variant: "grouped" }, ...overrides } as any;
    case "line":
      return { ...base, ...overrides } as any;
    case "pie":
      return { ...base, ...overrides } as any;
    case "area":
      return { ...base, ...overrides } as any;
    case "table":
      return { ...base, ...overrides } as any;
    case "kpi":
      return { ...base, ...overrides } as any;
  }
}
