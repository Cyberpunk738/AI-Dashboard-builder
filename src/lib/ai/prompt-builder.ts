import type { Column, ColumnSummary } from "@/types/dataset";
import type { DashboardConfig } from "@/types/dashboard";

// ============================================================
// Generate prompt
// ============================================================

export function buildGeneratePrompt(params: {
  columns: Column[];
  sampleRows: Record<string, unknown>[];
  summary: ColumnSummary[];
  rowCount: number;
  fileName?: string;
}): string {
  const { columns, sampleRows, summary, rowCount, fileName } = params;

  const schemaBlock = columns
    .map(
      (c) =>
        `- "${c.name}" (${c.type})${c.nullable ? " [nullable]" : ""}`
    )
    .join("\n");

  const summaryBlock = summary
    .map((s) => {
      const parts = [`"${s.name}": ${s.distinct} unique`];
      if (s.min !== undefined) parts.push(`min=${s.min}`);
      if (s.max !== undefined) parts.push(`max=${s.max}`);
      if (s.mean !== undefined) parts.push(`mean=${s.mean.toFixed(2)}`);
      parts.push(`nulls=${s.nullCount}`);
      const sampleStr = s.sampleValues
        .slice(0, 4)
        .map((v) => JSON.stringify(v))
        .join(", ");
      parts.push(`samples=[${sampleStr}]`);
      return parts.join(", ");
    })
    .join("\n");

  return `You are a data visualization expert analyzing a dataset to build a dashboard.

## Dataset
File: "${fileName ?? "uploaded file"}"
Total rows: ${rowCount.toLocaleString()}
Total columns: ${columns.length}

### Columns
${schemaBlock}

### Column Statistics
${summaryBlock}

### Sample Rows (first ${sampleRows.length})
${JSON.stringify(sampleRows, null, 2)}

## Output Rules

Examine the data and design 3-6 widgets that reveal the most meaningful patterns.

### Widget Type Selection Guide
- **line**: Time-series data (dates, months, years on x-axis). One line per segment.
- **bar**: Comparing values across categories. Use \`groupBy\` for sub-categories.
- **pie**: Parts-of-a-whole. Max 8 slices — group smaller items into "Other".
- **area**: Cumulative or volume-over-time patterns.
- **table**: When users need exact values, rankings, or raw data access.
- **kpi**: A single number that matters (total revenue, conversion rate, active users). Use \`transforms.aggregation\` to compute it.

### Mapping Rules
- \`data.mappings.category\` → x-axis / labels (use date columns for line/area)
- \`data.mappings.values\` → y-axis values (numeric columns only)
- \`data.mappings.groupBy\` → color splits / series breakdown
- Every value field MUST match an actual column name from the schema

### Layout Guidance
- KPI cards: \`w: 2-3, h: 2\`
- Charts: \`w: 4-6, h: 3-4\`
- Tables: \`w: 6-12, h: 3-5\`

### Formatting Rules
- Use short, descriptive titles: "Revenue by Month" not "Chart showing revenue by month"
- Add \`description\` explaining the insight this widget reveals
- For KPI widgets, set \`transforms.aggregation\` to sum, avg, or count
- For tables, set \`transforms.limit\` to 10-20 rows
- Set \`visualization.variant\` to "grouped" (default) or "stacked" for bar charts
- Set \`visualization.donut\` to true for pie charts where a donut looks better
- Set \`visualization.smooth\` to true for line charts with clean trends

Respond with ONLY valid JSON. No markdown, no code fences:

{
  "dashboard": {
    "title": "Dashboard Title",
    "description": "Brief description of what this dashboard shows"
  },
  "widgets": [
    {
      "type": "line",
      "title": "Revenue Over Time",
      "description": "Daily revenue trend showing growth pattern",
      "data": {
        "mappings": {
          "category": "date",
          "values": ["revenue"],
          "groupBy": "region"
        },
        "transforms": {
          "orderBy": "date",
          "orderDirection": "asc"
        }
      },
      "visualization": {
        "smooth": true,
        "showLegend": true
      },
      "layout": { "w": 6, "h": 4 }
    }
  ]
}`;
}

// ============================================================
// Chat prompt
// ============================================================

export function buildChatPrompt(params: {
  message: string;
  columns: Column[];
  sampleRows: Record<string, unknown>[];
  currentConfig: DashboardConfig;
  conversation: Array<{ role: string; content: string }>;
}): string {
  const { message, columns, sampleRows, currentConfig, conversation } =
    params;

  return `You are a dashboard AI assistant. The user has a dataset and dashboard open.

## Dataset Schema
${columns
  .map((c) => `- "${c.name}" (${c.type})`)
  .join("\n")}

## Sample Data (${sampleRows.length} rows)
${JSON.stringify(sampleRows.slice(0, 5), null, 2)}

## Current Dashboard
${JSON.stringify(
  {
    title: currentConfig.title,
    widgets: currentConfig.widgets.map((w) => ({
      id: w.id,
      type: w.type,
      title: w.title,
      dataMappings: w.data.mappings,
    })),
  },
  null,
  2
)}

## Conversation
${conversation.map((m) => `${m.role}: ${m.content}`).join("\n")}

## User's Question
${message}

## Response Rules
- Answer questions about the data using the schema and sample info
- If the user asks to modify the dashboard, include "actions" in your response
- Actions can be: UPDATE_WIDGET, ADD_WIDGET, REMOVE_WIDGET, UPDATE_LAYOUT
- For data questions you cannot answer from schema alone, explain what you know
- Keep responses concise and actionable

Respond as JSON (no markdown):
{
  "text": "Your natural language response here",
  "actions": [
    {
      "type": "UPDATE_WIDGET",
      "payload": { "id": "wdg_xxx", "title": "New Title" }
    }
  ]
}`;
}
