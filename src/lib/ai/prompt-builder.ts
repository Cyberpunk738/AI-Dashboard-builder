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
        .slice(0, 2)
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
  summary?: ColumnSummary[];
  rowCount?: number;
  currentConfig: DashboardConfig;
  conversation: Array<{ role: string; content: string; actions?: unknown[] }>;
}): string {
  const {
    message,
    columns,
    sampleRows,
    summary,
    rowCount,
    currentConfig,
    conversation,
  } = params;

  const summaryBlock = summary
    ? summary
        .map((s) => {
          const parts = [`"${s.name}": ${s.distinct} unique values`];
          if (s.min !== undefined) parts.push(`min=${s.min}`);
          if (s.max !== undefined) parts.push(`max=${s.max}`);
          if (s.mean !== undefined) parts.push(`mean=${s.mean.toFixed(2)}`);
          parts.push(`nulls=${s.nullCount}`);
          return parts.join(", ");
        })
        .join("\n")
    : "";

  const dashboardDetail = JSON.stringify(
    {
      title: currentConfig.title,
      widgets: currentConfig.widgets.map((w) => ({
        id: w.id,
        type: w.type,
        title: w.title,
        description: w.description,
        layout: w.layout,
        data: {
          mappings: w.data.mappings,
          transforms: w.data.transforms,
        },
      })),
    },
    null,
    2
  );

  const conversationBlock = conversation
    .map((m) => {
      const actionNote = m.actions?.length
        ? ` [${m.actions.length} dashboard action(s) applied]`
        : "";
      return `${m.role}: ${m.content}${actionNote}`;
    })
    .join("\n");

  return `You are a dashboard AI assistant helping a user explore their data. The user has a dataset loaded and a dashboard with visualizations.

## Dataset
${rowCount ? `Total rows: ${rowCount.toLocaleString()}` : ""}
${columns.length} columns

### Schema
${columns
  .map((c) => `- "${c.name}" (${c.type})${c.nullable ? " nullable" : ""}`)
  .join("\n")}

### Column Statistics
${summaryBlock || "(none provided)"}

### Sample Rows (first ${sampleRows.length})
${JSON.stringify(sampleRows, null, 2)}

## Current Dashboard
${dashboardDetail}

## Conversation
${conversationBlock || "(no prior conversation)"}

## User's Question
${message}

---

## Response Guidelines

1. **Answer naturally** — respond as a data analyst. Reference specific columns and values from the schema. Use the sample rows to illustrate patterns, but note they are samples.

2. **Dashboard actions** — use action markers to modify the dashboard. Embed them inline in your response:
   \`\`\`
   <<ACTION:{"type":"UPDATE_WIDGET","payload":{"id":"wdg_xxx","title":"Revenue by Country"}}>>
   \`\`\`

### Available Action Types

| Action | payload | Description |
|--------|---------|-------------|
| UPDATE_WIDGET | { id, title?, type?, description?, data?: { mappings?, transforms? }, layout?: { w?, h? }, visualization? } | Modify a widget's properties |
| ADD_WIDGET | { type, title?, data?: { mappings?, transforms? }, layout?: { w?, h? } } | Add a new widget |
| REMOVE_WIDGET | "widget_id" (string) | Remove a widget by ID |
| UPDATE_LAYOUT | { id, x?, y?, w?, h? } | Change widget position and size |
| DUPLICATE_WIDGET | "widget_id" (string) | Clone an existing widget |

### Action Rules
- Use widget IDs from the Current Dashboard section above
- For UPDATE_WIDGET, only include the fields that changed
- Data mappings use: { category: "column_name", values: ["col1", "col2"], groupBy?: "column_name" }
- Transforms use: { aggregation: "sum"|"avg"|"count"|"min"|"max"|"none", orderBy?: "col", orderDirection?: "asc"|"desc", limit?: number }
- You can include multiple action markers in one response

3. **Data questions** — if you cannot answer from the schema alone (e.g. exact values not in samples), explain what you know and suggest how to find the answer.

4. **Keep responses concise** — 2-4 sentences for most answers.}`;
}
