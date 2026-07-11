import type {
  LLMServiceResult,
  LLMServiceSuccess,
  LLMServiceConfig,
  LLMGenerateOutput,
} from "@/types/ai";
import { buildGeneratePrompt } from "./prompt-builder";
import { validateLLMResponse } from "@/lib/validation/llm-response";
import { DashboardConfigSchema } from "@/lib/validation/dashboard-schema";
import { generateWidgetId, generateDashboardId } from "@/lib/utils/id";
import type { DashboardConfig } from "@/types/dashboard";
import {
  getActiveProvider,
  buildHeaders,
  getBaseUrl,
  requireApiKey,
} from "./provider";

// ============================================================
// Configuration
// ============================================================

const DEFAULT_CONFIG = {
  maxRetries: 3,
  timeout: 60_000,
};

const RETRY_DELAYS = [1_000, 2_000, 4_000];

// ============================================================
// Low-level fetch wrapper
// ============================================================

interface LLMResponse {
  choices: Array<{
    message: {
      content: string | null;
    };
    finish_reason: string;
  }>;
  error?: {
    message: string;
    type: string;
  };
}

async function callLLM(
  prompt: string,
  config: LLMServiceConfig
): Promise<string> {
  const { provider, apiKey: envKey, model: envModel } = getActiveProvider();
  const apiKey = config.apiKey || envKey;
  const model = config.model || envModel;
  requireApiKey(provider, apiKey);
  const baseUrl = getBaseUrl(provider);

  const timeout = config.timeout ?? DEFAULT_CONFIG.timeout;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const body = JSON.stringify({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a data visualization expert. Respond only with valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: buildHeaders(apiKey),
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new LLMError(
        `LLM API error (${response.status}): ${errorBody}`,
        "LLM_ERROR"
      );
    }

    const data = (await response.json()) as LLMResponse;

    if (data.error) {
      throw new LLMError(
        `LLM API error: ${data.error.message}`,
        "LLM_ERROR"
      );
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new LLMError("Empty LLM response", "LLM_ERROR");
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================
// Error class
// ============================================================

class LLMError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "LLMError";
  }
}

// ============================================================
// Retry wrapper
// ============================================================

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number
): Promise<{ value: T; attempts: number }> {
  let lastError: unknown;
  let attempts = 0;

  while (attempts <= maxRetries) {
    attempts++;
    try {
      const value = await fn();
      return { value, attempts };
    } catch (error) {
      lastError = error;
      if (attempts <= maxRetries) {
        const delay = RETRY_DELAYS[attempts - 1] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1];
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// Response parsing
// ============================================================

function parseRawResponse(raw: string): unknown {
  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new LLMError(
      "Failed to parse LLM response as JSON",
      "INVALID_JSON"
    );
  }
}

// ============================================================
// Mapping: LLM output -> full DashboardConfig
// ============================================================

function mapToDashboardConfig(
  output: LLMGenerateOutput
): Record<string, unknown> {
  const widgets = output.widgets.map((w) => ({
    id: generateWidgetId(),
    type: w.type,
    title: w.title,
    description: w.description ?? "",
    layout: {
      x: 0,
      y: 0,
      w: w.layout.w,
      h: w.layout.h,
    },
    data: {
      mappings: {
        category: w.data.mappings.category,
        values: w.data.mappings.values,
        groupBy: w.data.mappings.groupBy,
      },
      transforms: {
        aggregation: w.data.transforms?.aggregation ?? "sum",
        orderBy: w.data.transforms?.orderBy,
        orderDirection: w.data.transforms?.orderDirection,
        limit: w.data.transforms?.limit,
      },
    },
    visualization: w.visualization ?? {},
  }));

  return {
    id: generateDashboardId(),
    title: output.dashboard?.title ?? "Untitled Dashboard",
    description: output.dashboard?.description ?? "",
    schemaVersion: 1,
    widgets,
  };
}

// ============================================================
// Public service
// ============================================================

export async function generateDashboard(
  request: {
    columns: Parameters<typeof buildGeneratePrompt>[0];
  },
  config: LLMServiceConfig
): Promise<LLMServiceResult> {
  try {
    // 1. Build the prompt
    const prompt = buildGeneratePrompt(request.columns);

    // 2. Call LLM with retry
    const { value: rawContent, attempts } = await withRetry(
      () => callLLM(prompt, config),
      config.maxRetries ?? DEFAULT_CONFIG.maxRetries
    );

    // 3. Parse JSON
    const parsed = parseRawResponse(rawContent);

    // 4. Validate LLM output shape
    const validation = validateLLMResponse(parsed);
    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "LLM response did not match expected schema",
        code: "VALIDATION_ERROR",
        details: validation.errors,
        attempts,
      };
    }

    // 5. Map to full DashboardConfig
    const configMapped = mapToDashboardConfig(validation.data);

    // 6. Validate the mapped config
    const configValidation = DashboardConfigSchema.safeParse(configMapped);
    if (!configValidation.success) {
      return {
        success: false,
        error: "Generated dashboard config failed validation",
        code: "VALIDATION_ERROR",
        details: configValidation.error.issues,
        attempts,
      };
    }

    return {
      success: true,
      config: configValidation.data as DashboardConfig,
      raw: validation.data,
      attempts,
    } as LLMServiceSuccess;
  } catch (error) {
    if (error instanceof LLMError) {
      return {
        success: false,
        error: error.message,
        code: error.code as LLMServiceResult extends { code: infer C }
          ? C
          : never,
        attempts: 0,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error generating dashboard",
      code: "LLM_ERROR",
      attempts: 0,
    };
  }
}
