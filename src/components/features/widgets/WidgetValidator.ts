import { SUPPORTED_WIDGET_TYPES } from "@/types/dashboard-schema";
import type { WidgetConfig } from "@/types/dashboard-schema";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_FIELDS: (keyof WidgetConfig)[] = [
  "id",
  "type",
  "title",
  "layout",
  "data",
];

export function validateWidgetConfig(
  widget: Partial<WidgetConfig>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (widget[field] == null) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  if (widget.id && typeof widget.id !== "string") {
    errors.push('"id" must be a string');
  }

  if (widget.type && !SUPPORTED_WIDGET_TYPES.includes(widget.type as any)) {
    errors.push(
      `Unsupported widget type: "${widget.type}". Supported: ${SUPPORTED_WIDGET_TYPES.join(", ")}`
    );
  }

  if (widget.title && typeof widget.title === "string" && widget.title.length > 200) {
    warnings.push('"title" exceeds 200 characters');
  }

  if (widget.layout) {
    if (typeof widget.layout.w !== "number" || widget.layout.w < 1) {
      errors.push('"layout.w" must be a positive number');
    }
    if (typeof widget.layout.h !== "number" || widget.layout.h < 1) {
      errors.push('"layout.h" must be a positive number');
    }
  }

  if (widget.data) {
    const mappings = widget.data.mappings;
    if (!mappings) {
      errors.push('"data.mappings" is required');
    } else {
      if (!mappings.values || !Array.isArray(mappings.values)) {
        errors.push('"data.mappings.values" must be an array');
      } else if (mappings.values.length === 0) {
        warnings.push('"data.mappings.values" is empty — no data will render');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function isWidgetConfig(obj: unknown): obj is WidgetConfig {
  if (!obj || typeof obj !== "object") return false;
  const w = obj as Record<string, unknown>;
  return (
    typeof w.id === "string" &&
    typeof w.type === "string" &&
    typeof w.title === "string" &&
    w.layout !== null &&
    typeof w.layout === "object" &&
    w.data !== null &&
    typeof w.data === "object"
  );
}
