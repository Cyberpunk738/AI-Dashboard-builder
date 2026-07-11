import { z } from "zod";

// ============================================================
// Shared sub-schemas matching the dashboard-schema types
// ============================================================

const WidgetTypeSchema = z.enum([
  "bar",
  "line",
  "pie",
  "area",
  "table",
  "kpi",
]);

const DataMappingSchema = z.object({
  category: z.string().optional(),
  values: z.array(z.string()).optional(),
  groupBy: z.string().optional(),
  labelField: z.string().optional(),
  comparisonField: z.string().optional(),
  comparisonType: z
    .enum(["previous_period", "target", "absolute", "percentage"])
    .optional(),
});

const DataTransformSchema = z.object({
  aggregation: z
    .enum(["sum", "avg", "count", "count_distinct", "min", "max", "none"])
    .optional(),
  groupBy: z.array(z.string()).optional(),
  orderBy: z.string().optional(),
  orderDirection: z.enum(["asc", "desc"]).optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
  rollingWindow: z.number().int().positive().optional(),
});

// ============================================================
// Per-command payload schemas
// ============================================================

export const UpdateWidgetPayloadSchema = z.object({
  id: z.string().min(1, "Widget ID is required"),
  title: z.string().min(1).max(200).optional(),
  type: WidgetTypeSchema.optional(),
  description: z.string().max(500).optional(),
  data: z
    .object({
      mappings: DataMappingSchema.optional(),
      transforms: DataTransformSchema.optional(),
    })
    .optional(),
  layout: z
    .object({
      w: z.number().int().min(1).max(24).optional(),
      h: z.number().int().min(1).optional(),
      minW: z.number().int().min(1).optional(),
      minH: z.number().int().min(1).optional(),
    })
    .optional(),
  visualization: z.record(z.unknown()).optional(),
});

export const AddWidgetPayloadSchema = z.object({
  type: WidgetTypeSchema,
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  data: z
    .object({
      mappings: DataMappingSchema.optional(),
      transforms: DataTransformSchema.optional(),
    })
    .optional(),
  layout: z
    .object({
      w: z.number().int().min(1).max(24).optional(),
      h: z.number().int().min(1).optional(),
    })
    .optional(),
  visualization: z.record(z.unknown()).optional(),
});

export const RemoveWidgetPayloadSchema = z.object({
  id: z.string().min(1, "Widget ID is required"),
});

export const DuplicateWidgetPayloadSchema = z.object({
  id: z.string().min(1, "Widget ID is required"),
});

export const UpdateLayoutPayloadSchema = z.object({
  id: z.string().min(1, "Widget ID is required"),
  x: z.number().int().min(0).optional(),
  y: z.number().int().min(0).optional(),
  w: z.number().int().min(1).max(24).optional(),
  h: z.number().int().min(1).optional(),
  minW: z.number().int().min(1).optional(),
  minH: z.number().int().min(1).optional(),
});

export const SetDashboardTitlePayloadSchema = z.object({
  title: z.string().min(1).max(200, "Title must be under 200 characters"),
});

// ============================================================
// Command schemas by type
// ============================================================

export const CommandSchemas: Record<
  string,
  z.ZodType<unknown>
> = {
  UPDATE_WIDGET: UpdateWidgetPayloadSchema,
  ADD_WIDGET: AddWidgetPayloadSchema,
  REMOVE_WIDGET: RemoveWidgetPayloadSchema,
  DUPLICATE_WIDGET: DuplicateWidgetPayloadSchema,
  UPDATE_LAYOUT: UpdateLayoutPayloadSchema,
  SET_DASHBOARD_TITLE: SetDashboardTitlePayloadSchema,
};

// ============================================================
// Valid command types
// ============================================================

export const VALID_COMMAND_TYPES = Object.keys(CommandSchemas);
