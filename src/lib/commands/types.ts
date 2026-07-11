import type { WidgetType, WidgetConfig, DataMapping, DataTransform } from "@/types/dashboard";

// ============================================================
// Command type — the discriminated union powering all actions
// ============================================================

export type CommandType =
  | "UPDATE_WIDGET"
  | "ADD_WIDGET"
  | "REMOVE_WIDGET"
  | "DUPLICATE_WIDGET"
  | "UPDATE_LAYOUT"
  | "SET_DASHBOARD_TITLE";

// ── Per-type payloads ──

export interface UpdateWidgetPayload {
  id: string;
  title?: string;
  type?: WidgetType;
  description?: string;
  data?: Partial<{
    mappings: Partial<DataMapping>;
    transforms: Partial<DataTransform>;
  }>;
  layout?: Partial<{
    w: number;
    h: number;
    minW: number;
    minH: number;
  }>;
  visualization?: Record<string, unknown>;
}

export interface AddWidgetPayload {
  type: WidgetType;
  title?: string;
  description?: string;
  data?: Partial<{
    mappings: Partial<DataMapping>;
    transforms: Partial<DataTransform>;
  }>;
  layout?: Partial<{
    w: number;
    h: number;
  }>;
  visualization?: Record<string, unknown>;
}

export interface RemoveWidgetPayload {
  id: string;
}

export interface DuplicateWidgetPayload {
  id: string;
}

export interface UpdateLayoutPayload {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  minW?: number;
  minH?: number;
}

export interface SetDashboardTitlePayload {
  title: string;
}

// ── Discriminated command ──

export type CommandPayload =
  | UpdateWidgetPayload
  | AddWidgetPayload
  | RemoveWidgetPayload
  | DuplicateWidgetPayload
  | UpdateLayoutPayload
  | SetDashboardTitlePayload;

export interface Command {
  type: CommandType;
  payload: CommandPayload;
}

// ============================================================
// Command result
// ============================================================

export interface CommandSuccess {
  success: true;
  description: string;
  widgetId?: string;
}

export interface CommandError {
  success: false;
  error: string;
  code:
    | "UNKNOWN_TYPE"
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "INVALID_COLUMN"
    | "EXECUTION_ERROR";
  details?: string[];
}

export type CommandResult = CommandSuccess | CommandError;

// ============================================================
// Semantic validation context
// ============================================================

export interface ValidationContext {
  /** IDs of all widgets currently on the dashboard */
  widgetIds: string[];
  /** Names of all columns in the dataset */
  columnNames: string[];
  /** Widget types supported by the renderer */
  validTypes: WidgetType[];
}

// ============================================================
// Parser output (NL → multiple commands)
// ============================================================

export interface ParseResult {
  commands: Command[];
  explanation: string;
}
