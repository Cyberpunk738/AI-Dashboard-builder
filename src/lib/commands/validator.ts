import type {
  Command,
  CommandResult,
  ValidationContext,
} from "./types";
import { CommandSchemas, VALID_COMMAND_TYPES } from "./schemas";
import type { AddWidgetPayload, UpdateWidgetPayload } from "./types";

// ============================================================
// Structural validation (Zod)
// ============================================================

function validateStructure(
  type: string,
  payload: unknown
): { valid: true } | { valid: false; errors: string[] } {
  const schema = CommandSchemas[type];
  if (!schema) {
    return {
      valid: false,
      errors: [`Unknown command type "${type}". Valid types: ${VALID_COMMAND_TYPES.join(", ")}`],
    };
  }

  const result = schema.safeParse(payload);
  if (result.success) {
    return { valid: true };
  }

  return {
    valid: false,
    errors: result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    ),
  };
}

// ============================================================
// Semantic validation (context-aware)
// ============================================================

function validateSemantics(
  command: Command,
  ctx: ValidationContext
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = [];
  const p = command.payload;

  switch (command.type) {
    case "UPDATE_WIDGET": {
      const payload = p as UpdateWidgetPayload;
      if (!ctx.widgetIds.includes(payload.id)) {
        errors.push(`Widget "${payload.id}" not found on dashboard`);
      }
      if (payload.type && !ctx.validTypes.includes(payload.type)) {
        errors.push(`Invalid widget type "${payload.type}"`);
      }
      checkColumns(asStringValues(payload.data?.mappings?.values), ctx.columnNames, errors);
      if (payload.data?.mappings?.category) {
        checkColumn(payload.data.mappings.category, ctx.columnNames, errors, "category");
      }
      if (payload.data?.mappings?.groupBy) {
        checkColumn(payload.data.mappings.groupBy, ctx.columnNames, errors, "groupBy");
      }
      break;
    }

    case "ADD_WIDGET": {
      const payload = p as AddWidgetPayload;
      if (!ctx.validTypes.includes(payload.type)) {
        errors.push(`Invalid widget type "${payload.type}"`);
      }
      checkColumns(asStringValues(payload.data?.mappings?.values), ctx.columnNames, errors);
      if (payload.data?.mappings?.category) {
        checkColumn(payload.data.mappings.category, ctx.columnNames, errors, "category");
      }
      if (payload.data?.mappings?.groupBy) {
        checkColumn(payload.data.mappings.groupBy, ctx.columnNames, errors, "groupBy");
      }
      break;
    }

    case "REMOVE_WIDGET": {
      const id = p as { id: string };
      if (!ctx.widgetIds.includes(id.id)) {
        errors.push(`Widget "${id.id}" not found on dashboard`);
      }
      break;
    }

    case "DUPLICATE_WIDGET": {
      const id = p as { id: string };
      if (!ctx.widgetIds.includes(id.id)) {
        errors.push(`Widget "${id.id}" not found on dashboard`);
      }
      break;
    }

    case "UPDATE_LAYOUT": {
      const id = p as { id: string };
      if (!ctx.widgetIds.includes(id.id)) {
        errors.push(`Widget "${id.id}" not found on dashboard`);
      }
      break;
    }

    case "SET_DASHBOARD_TITLE":
      // No semantic checks needed
      break;
  }

  return errors.length
    ? { valid: false, errors }
    : { valid: true };
}

// ── Helpers ──

function checkColumn(
  name: string | undefined,
  validNames: string[],
  errors: string[],
  label?: string
) {
  if (name && !validNames.includes(name)) {
    errors.push(
      `Column "${name}"${label ? ` (${label})` : ""} not found in dataset. Valid columns: ${validNames.join(", ")}`
    );
  }
}

function checkColumns(
  names: string[] | undefined,
  validNames: string[],
  errors: string[]
) {
  if (!names) return;
  for (const name of names) {
    if (!validNames.includes(name)) {
      errors.push(
        `Column "${name}" not found in dataset. Valid columns: ${validNames.join(", ")}`
      );
    }
  }
}

// ============================================================
// Combined validation
// ============================================================

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

export function validateCommand(
  command: Command,
  ctx: ValidationContext
): ValidationResult {
  // 1. Structural check (Zod)
  const structural = validateStructure(command.type, command.payload);
  if (!structural.valid) {
    return { valid: false, errors: structural.errors };
  }

  // 2. Semantic check (context)
  const semantic = validateSemantics(command, ctx);
  if (!semantic.valid) {
    return { valid: false, errors: semantic.errors };
  }

  return { valid: true };
}

export function validateCommands(
  commands: Command[],
  ctx: ValidationContext
): { valid: Command[]; invalid: Array<{ command: Command; errors: string[] }> } {
  const valid: Command[] = [];
  const invalid: Array<{ command: Command; errors: string[] }> = [];

  for (const command of commands) {
    const result = validateCommand(command, ctx);
    if (result.valid) {
      valid.push(command);
    } else {
      invalid.push({ command, errors: result.errors });
    }
  }

  return { valid, invalid };
}

// ── Normalise values field (string[] | ChartSeries[]) to string[] ──

function asStringValues(
  values: unknown
): string[] | undefined {
  if (!Array.isArray(values)) return undefined;
  return values.map((v) => (typeof v === "string" ? v : (v as { field: string }).field));
}
