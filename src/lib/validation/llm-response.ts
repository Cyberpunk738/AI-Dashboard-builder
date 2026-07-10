import { z } from "zod";

// ---------------------------------------------------------------
// This schema defines exactly what we ask the LLM to return.
// It's intentionally simpler than the full DashboardConfig —
// the LLM only specifies data intent and sizing; the service
// layer fills in IDs, positions, defaults, and metadata.
// ---------------------------------------------------------------

const LLMWidgetLayoutSchema = z.object({
  w: z.number().int().min(1).max(24).default(4),
  h: z.number().int().min(1).default(3),
});

const LLMDataMappingSchema = z.object({
  category: z.string().optional(),
  values: z.array(z.string()).min(1, "At least one value field is required"),
  groupBy: z.string().optional(),
});

const LLMDataTransformSchema = z.object({
  aggregation: z
    .enum(["sum", "avg", "count", "min", "max", "none"])
    .optional(),
  orderBy: z.string().optional(),
  orderDirection: z.enum(["asc", "desc"]).optional(),
  limit: z.number().int().positive().max(10000).optional(),
});

const LLMWidgetOutputSchema = z.object({
  type: z.enum(["bar", "line", "pie", "area", "table", "kpi"]),
  title: z
    .string()
    .min(1, "Widget title is required")
    .max(100, "Title must be under 100 characters"),
  description: z.string().max(300).optional(),
  data: z.object({
    mappings: LLMDataMappingSchema,
    transforms: LLMDataTransformSchema.optional(),
  }),
  visualization: z.record(z.unknown()).optional(),
  layout: LLMWidgetLayoutSchema,
});

export const LLMGenerateOutputSchema = z.object({
  dashboard: z
    .object({
      title: z.string().max(200).optional(),
      description: z.string().max(500).optional(),
    })
    .optional(),
  widgets: z
    .array(LLMWidgetOutputSchema)
    .min(1, "At least one widget is required")
    .max(20, "Maximum 20 widgets per dashboard"),
});

export type LLMGenerateOutput = z.infer<typeof LLMGenerateOutputSchema>;
export type LLMWidgetOutput = z.infer<typeof LLMWidgetOutputSchema>;

// ---------------------------------------------------------------
// Validation result
// ---------------------------------------------------------------

export interface LLMValidationResult {
  success: boolean;
  data?: LLMGenerateOutput;
  errors?: string[];
}

export function validateLLMResponse(input: unknown): LLMValidationResult {
  const result = LLMGenerateOutputSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => {
      const path = issue.path.join(".");
      return `${path}: ${issue.message}`;
    }),
  };
}

// ---------------------------------------------------------------
// Partial / progressive validation (for streaming use cases)
// ---------------------------------------------------------------

export function validatePartialWidget(
  input: unknown
): {
  valid: boolean;
  errors: string[];
} {
  const result = LLMWidgetOutputSchema.safeParse(input);
  return {
    valid: result.success,
    errors: result.success
      ? []
      : result.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`
        ),
  };
}
