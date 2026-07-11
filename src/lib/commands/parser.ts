import type { Column, ColumnSummary } from "@/types/dataset";
import type { DashboardConfig } from "@/types/dashboard";
import type { Command, ParseResult } from "./types";
import {
  getActiveProvider,
  buildHeaders,
  getBaseUrl,
  requireApiKey,
} from "@/lib/ai/provider";

// ============================================================
// Build the parser prompt
// ============================================================

export function buildParsePrompt(params: {
  input: string;
  columns: Column[];
  summary?: ColumnSummary[];
  currentConfig: DashboardConfig;
}): string {
  const { input, columns, summary, currentConfig } = params;

  const summaryBlock = summary
    ? summary
        .map(
          (s) =>
            `- "${s.name}": ${s.distinct} unique${s.min !== undefined ? ` [${s.min}–${s.max}]` : ""}${s.mean !== undefined ? ` mean=${s.mean.toFixed(2)}` : ""}`
        )
        .join("\n")
    : "";

  const widgetBlock = currentConfig.widgets.length
    ? currentConfig.widgets
        .map(
          (w) =>
            `- id="${w.id}" type=${w.type} title="${w.title}"`
        )
        .join("\n")
    : "(none)";

  return `You convert natural language commands into structured dashboard actions.

## Context

### Columns
${columns.map((c) => `- "${c.name}" (${c.type})`).join("\n")}

### Column Statistics
${summaryBlock || "(none)"}

### Current Widgets
${widgetBlock}

## Command

Convert this user request into one or more commands:

"${input}"

## Available Commands

| Command | Payload | When to use |
|---------|---------|-------------|
| UPDATE_WIDGET | { id (required), title?, type?, description?, data?: { mappings?: { category?, values?, groupBy? }, transforms?: { aggregation?, orderBy?, orderDirection?, limit? } }, layout?: { w?, h? }, visualization? } | Change a widget's type, title, data mappings, dimensions, or style |
| ADD_WIDGET | { type (required), title?, data?: { mappings?: { category?, values?, groupBy? }, transforms?: { aggregation?, limit? } }, layout?: { w?, h? } } | Create a new visualization for a specific column or comparison |
| REMOVE_WIDGET | { id } | Delete a widget from the dashboard |
| DUPLICATE_WIDGET | { id } | Clone an existing widget |
| UPDATE_LAYOUT | { id, x?, y?, w?, h? } | Resize or reposition a widget |
| SET_DASHBOARD_TITLE | { title } | Rename the entire dashboard |

## Rules

1. Use widget IDs from Current Widgets above — never invent IDs
2. For "show X by Y" — ADD_WIDGET with type="bar", category=Y, values=[X]
3. For "change ... to ... chart" — UPDATE_WIDGET with type="bar"|"line"|"pie"
4. For "add ... chart for ... by ..." — ADD_WIDGET with type, category, values
5. Use column names exactly as listed — never fabricate column names
6. If no prior widgets exist and user asks to show data, use ADD_WIDGET
7. For table requests, use type="table" with values as the columns to show

## Output Format

Respond with ONLY valid JSON. No markdown, no explanation:

{
  "commands": [
    {
      "type": "UPDATE_WIDGET",
      "payload": { "id": "wdg_xxx", "type": "bar" }
    }
  ],
  "explanation": "Brief natural language explanation of what was done"
}`;
}

// ============================================================
// Call the LLM parser
// ============================================================

export async function parseNaturalLanguage(params: {
  input: string;
  columns: Column[];
  summary?: ColumnSummary[];
  currentConfig: DashboardConfig;
  apiKey?: string;
  model?: string;
}): Promise<ParseResult> {
  const { input, columns, summary, currentConfig, apiKey, model } = params;

  const { provider, apiKey: envKey, model: envModel } = getActiveProvider();
  const activeKey = apiKey || envKey;
  const activeModel = model || envModel;
  requireApiKey(provider, activeKey);
  const baseUrl = getBaseUrl(provider);

  const prompt = buildParsePrompt({
    input,
    columns,
    summary,
    currentConfig,
  });

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: buildHeaders(activeKey),
    body: JSON.stringify({
      model: activeModel,
      messages: [
        {
          role: "system",
          content:
            "You convert natural language to structured dashboard commands. Output only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Parser API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty parser response");
  }

  const parsed = JSON.parse(content) as {
    commands?: unknown[];
    explanation?: string;
  };

  return {
    commands: (parsed.commands ?? []) as Command[],
    explanation: parsed.explanation ?? "",
  };
}
