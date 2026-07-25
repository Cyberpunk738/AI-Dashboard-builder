import type { DashboardConfig, WidgetConfig } from "@/types/dashboard";
import type { Column } from "@/types/dataset";
import { generateDashboardId, generateWidgetId } from "@/lib/utils/id";
import { calculateStats } from "@/lib/analytics/stats";
import { analyzeFinancialData } from "@/lib/analytics/financial-analytics";

interface GenerateInput {
  columns: Column[];
  sampleRows: Record<string, unknown>[];
  fileName?: string;
}

function findCol(columns: Column[], keywords: string[]): Column | undefined {
  return columns.find((c) =>
    keywords.some((kw) => c.name.toLowerCase().includes(kw))
  );
}

export function generateAutoDashboard(input: GenerateInput): DashboardConfig {
  const { columns, sampleRows, fileName } = input;
  const widgets: WidgetConfig[] = [];

  // Exclude ID columns from primary metrics if possible
  const nonIdColumns = columns.filter(
    (c) => !c.name.toLowerCase().endsWith("id") && c.name.toLowerCase() !== "id"
  );
  
  const numericCols = (nonIdColumns.length > 0 ? nonIdColumns : columns).filter(
    (c) => c.type === "number"
  );
  const dateCols = columns.filter((c) => c.type === "date");
  const categoricalCols = (nonIdColumns.length > 0 ? nonIdColumns : columns).filter(
    (c) => c.type === "string" || c.type === "boolean"
  );

  // Financial Column Detection
  const dateCol = findCol(columns, ["date", "time", "txn_date", "created_at"]) || dateCols[0];
  const debitCol = findCol(numericCols, ["debit", "withdrawal", "spent", "expense", "outflow"]);
  const creditCol = findCol(numericCols, ["credit", "deposit", "income", "received", "inflow"]);
  const amountCol = findCol(numericCols, ["amount", "price", "cost", "salary", "balance"]);
  const categoryCol = findCol(categoricalCols, ["category", "payee", "vendor", "merchant", "description"]);
  const balanceCol = findCol(numericCols, ["balance", "running_balance"]);

  const isBankStatement = Boolean(
    debitCol || creditCol || balanceCol || (amountCol && categoryCol)
  );

  let currentY = 0;

  if (isBankStatement) {
    // Run Financial Analytics Algorithm
    const finAnalytics = analyzeFinancialData(sampleRows);

    // 1. KPI Cards Row: Net Amount, Total Income, Total Expenses, Savings Rate
    let kpiCount = 0;
    const valCol = amountCol || debitCol || creditCol || numericCols[0];

    if (valCol) {
      widgets.push({
        id: generateWidgetId(),
        type: "kpi",
        title: `Net Cash Flow (${valCol.name})`,
        description: `Total net sum for ${valCol.name}`,
        layout: { x: kpiCount * 3, y: currentY, w: 3, h: 2 },
        data: {
          mappings: { values: [valCol.name] },
          transforms: { aggregation: "sum" },
        },
        visualization: {
          format: { number: "currency", currency: "USD" },
          trend: "auto",
        },
      });
      kpiCount++;
    }

    if (creditCol) {
      widgets.push({
        id: generateWidgetId(),
        type: "kpi",
        title: "Total Income / Credit",
        description: `Total incoming credits`,
        layout: { x: kpiCount * 3, y: currentY, w: 3, h: 2 },
        data: {
          mappings: { values: [creditCol.name] },
          transforms: { aggregation: "sum" },
        },
        visualization: {
          format: { number: "currency", currency: "USD" },
          trend: "auto",
        },
      });
      kpiCount++;
    }

    if (debitCol) {
      widgets.push({
        id: generateWidgetId(),
        type: "kpi",
        title: "Total Expenses / Debit",
        description: `Total outgoing debits`,
        layout: { x: kpiCount * 3, y: currentY, w: 3, h: 2 },
        data: {
          mappings: { values: [debitCol.name] },
          transforms: { aggregation: "sum" },
        },
        visualization: {
          format: { number: "currency", currency: "USD" },
          trend: "auto",
        },
      });
      kpiCount++;
    }

    if (kpiCount < 4) {
      widgets.push({
        id: generateWidgetId(),
        type: "kpi",
        title: "Total Transactions",
        description: "Total financial entries",
        layout: { x: kpiCount * 3, y: currentY, w: 3, h: 2 },
        data: {
          mappings: { values: [columns[0].name] },
          transforms: { aggregation: "count" },
        },
        visualization: {
          format: { number: "number" },
          trend: "auto",
        },
      });
      kpiCount++;
    }

    currentY += 2;

    // 2. Main Cash Flow Trend Chart
    if (dateCol && valCol) {
      widgets.push({
        id: generateWidgetId(),
        type: "area",
        title: `Cash Flow Trend Over Time`,
        description: `${valCol.name} grouped by ${dateCol.name}`,
        layout: { x: 0, y: currentY, w: 8, h: 4 },
        data: {
          mappings: {
            category: dateCol.name,
            values: [{ field: valCol.name, label: valCol.name, aggregation: "sum" }],
          },
        },
        visualization: {
          axes: {
            x: { title: dateCol.name },
            y: { title: valCol.name, format: { number: "currency" } },
          },
        },
      });
    }

    // 3. Category / Payee Expenditure Breakdown Chart
    if (categoryCol && valCol) {
      widgets.push({
        id: generateWidgetId(),
        type: "bar",
        title: `Spending by ${categoryCol.name}`,
        description: `Total ${valCol.name} per ${categoryCol.name}`,
        layout: { x: dateCol ? 8 : 0, y: currentY, w: dateCol ? 4 : 6, h: 4 },
        data: {
          mappings: {
            category: categoryCol.name,
            values: [{ field: valCol.name, label: valCol.name, aggregation: "sum" }],
          },
        },
        visualization: {
          variant: "grouped",
          horizontal: false,
          axes: {
            x: { title: categoryCol.name },
            y: { title: valCol.name },
          },
        },
      });
    }

    if (dateCol || categoryCol) {
      currentY += 4;
    }
  } else {
    // ============================================================
    // General Dataset Dashboard Layout with Statistical Analysis
    // ============================================================
    const topMetrics = numericCols.slice(0, 4);

    topMetrics.forEach((col, idx) => {
      const isAvgMetric = col.name.toLowerCase().includes("avg") || col.name.toLowerCase().includes("minutes");
      widgets.push({
        id: generateWidgetId(),
        type: "kpi",
        title: isAvgMetric ? `Avg ${col.name.replace(/_/g, " ")}` : `Total ${col.name.replace(/_/g, " ")}`,
        description: `Statistical summary for ${col.name.replace(/_/g, " ")}`,
        layout: { x: idx * 3, y: currentY, w: 3, h: 2 },
        data: {
          mappings: { values: [col.name] },
          transforms: { aggregation: isAvgMetric ? "avg" : "sum" },
        },
        visualization: {
          format: { number: "compact" },
          trend: "auto",
        },
      });
    });

    if (topMetrics.length > 0) {
      currentY += 2;
    }

    // Main Time Series Trend Chart
    if (dateCols.length > 0 && numericCols.length > 0) {
      const xCol = dateCols[0];
      const primaryMetric = numericCols[0];
      const secondaryMetric = numericCols.length > 1 ? numericCols[1] : undefined;

      const seriesList = [
        { field: primaryMetric.name, label: primaryMetric.name.replace(/_/g, " "), aggregation: "sum" as const },
      ];
      if (secondaryMetric) {
        seriesList.push({
          field: secondaryMetric.name,
          label: secondaryMetric.name.replace(/_/g, " "),
          aggregation: "sum" as const,
        });
      }

      widgets.push({
        id: generateWidgetId(),
        type: "area",
        title: `${primaryMetric.name.replace(/_/g, " ")} Trend Over Time`,
        description: `Time-series breakdown by ${xCol.name.replace(/_/g, " ")}`,
        layout: { x: 0, y: currentY, w: 8, h: 4 },
        data: {
          mappings: {
            category: xCol.name,
            values: seriesList,
          },
        },
        visualization: {
          axes: {
            x: { title: xCol.name.replace(/_/g, " ") },
            y: { title: primaryMetric.name.replace(/_/g, " ") },
          },
        },
      });
    }

    // Category Distribution Chart
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      const catCol = categoricalCols[0];
      const metric = numericCols[0];
      const chartX = dateCols.length > 0 ? 8 : 0;
      const chartW = dateCols.length > 0 ? 4 : 6;

      widgets.push({
        id: generateWidgetId(),
        type: "bar",
        title: `${metric.name.replace(/_/g, " ")} by ${catCol.name.replace(/_/g, " ")}`,
        description: `Distribution across ${catCol.name.replace(/_/g, " ")}`,
        layout: { x: chartX, y: currentY, w: chartW, h: 4 },
        data: {
          mappings: {
            category: catCol.name,
            values: [{ field: metric.name, label: metric.name.replace(/_/g, " "), aggregation: "sum" }],
          },
        },
        visualization: {
          variant: "grouped",
          horizontal: false,
          axes: {
            x: { title: catCol.name.replace(/_/g, " ") },
            y: { title: metric.name.replace(/_/g, " ") },
          },
        },
      });
    }

    if (dateCols.length > 0 || (categoricalCols.length > 0 && numericCols.length > 0)) {
      currentY += 4;
    }
  }

  // Complete Interactive Records Table Widget
  widgets.push({
    id: generateWidgetId(),
    type: "table",
    title: "Complete Records Table",
    description: "Interactive data table with search and column sorting",
    layout: { x: 0, y: currentY, w: 12, h: 5 },
    data: {
      mappings: {
        values: columns.map((c) => c.name),
      },
    },
    visualization: {
      pageSize: 10,
      columns: columns.map((c) => ({
        field: c.name,
        header: c.name.replace(/_/g, " "),
        sortable: true,
      })),
    },
  });

  const titleName = fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : "Data";

  return {
    id: generateDashboardId(),
    title: isBankStatement ? `${titleName} Financial Dashboard` : `${titleName} Dashboard`,
    description: isBankStatement
      ? "Auto-generated financial analysis detailing income, expenses, and transaction trends."
      : "Auto-generated visual dashboard based on dataset metrics.",
    schemaVersion: 1,
    cols: 12,
    layout: "grid",
    widgets,
  };
}

// Backward-compatible alias
export const generateFallbackDashboard = generateAutoDashboard;
