import type { Column, ColumnSummary } from "./dataset";
import type { DashboardConfig } from "./dashboard";

// ============================================================
// Request types
// ============================================================

export interface LLMGenerateRequest {
  columns: Column[];
  sampleRows: Record<string, unknown>[];
  summary: ColumnSummary[];
  rowCount: number;
  fileName?: string;
}

export interface LLMChatRequest {
  message: string;
  columns: Column[];
  sampleRows: Record<string, unknown>[];
  currentConfig: DashboardConfig;
  conversation: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

// ============================================================
// LLM raw output types (what the LLM actually returns)
// These are intentionally simpler than the full WidgetConfig
// ============================================================

export interface LLMWidgetOutput {
  type: "bar" | "line" | "pie" | "area" | "table" | "kpi";
  title: string;
  description?: string;
  data: {
    mappings: {
      category?: string;
      values: string[];
      groupBy?: string;
    };
    transforms?: {
      aggregation?: string;
      orderBy?: string;
      orderDirection?: "asc" | "desc";
      limit?: number;
    };
  };
  visualization?: Record<string, unknown>;
  layout: {
    w: number;
    h: number;
  };
}

export interface LLMGenerateOutput {
  dashboard?: {
    title?: string;
    description?: string;
  };
  widgets: LLMWidgetOutput[];
}

// ============================================================
// Response types the frontend uses
// ============================================================

export interface LLMGenerateResponse {
  config: DashboardConfig;
  raw: LLMGenerateOutput;
}

// ============================================================
// Service-level types
// ============================================================

export interface LLMServiceConfig {
  apiKey: string;
  model: string;
  maxRetries?: number;
  timeout?: number;
}

export interface LLMServiceSuccess {
  success: true;
  config: DashboardConfig;
  raw: LLMGenerateOutput;
  attempts: number;
}

export interface LLMServiceError {
  success: false;
  error: string;
  code: "INVALID_REQUEST" | "LLM_ERROR" | "INVALID_JSON" | "VALIDATION_ERROR" | "TIMEOUT";
  details?: unknown;
  attempts: number;
}

export type LLMServiceResult = LLMServiceSuccess | LLMServiceError;

// ============================================================
// Chat types
// ============================================================

export interface WidgetAction {
  type: "UPDATE_WIDGET" | "ADD_WIDGET" | "REMOVE_WIDGET" | "UPDATE_LAYOUT";
  payload: unknown;
}

export interface LLMChatResponse {
  text: string;
  actions?: WidgetAction[];
}

export type LLMProvider = "openai" | "anthropic" | "custom";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
}
