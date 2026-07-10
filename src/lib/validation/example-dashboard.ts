import type { DashboardConfig } from "@/types/dashboard-schema";

export const EXAMPLE_DASHBOARD: DashboardConfig = {
  id: "db_example_001",
  title: "E-Commerce Performance Dashboard",
  description:
    "Daily e-commerce KPIs including revenue, orders, products, and customer acquisition trends.",
  schemaVersion: 1,
  cols: 12,
  theme: "light",
  layout: "grid",
  metadata: {
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-10T12:00:00.000Z",
    createdBy: "ai",
    source: "ai_generated",
    tags: ["ecommerce", "kpi", "daily"],
    version: 1,
  },
  variables: [
    {
      id: "var_date_range",
      name: "Date Range",
      type: "date",
      defaultValue: "2026-01-01",
      options: [
        { label: "Last 7 days", value: "last_7" },
        { label: "Last 30 days", value: "last_30" },
        { label: "This quarter", value: "this_quarter" },
      ],
    },
    {
      id: "var_region",
      name: "Region",
      type: "string",
      defaultValue: "all",
      options: [
        { label: "All Regions", value: "all" },
        { label: "North America", value: "NA" },
        { label: "Europe", value: "EU" },
        { label: "Asia Pacific", value: "APAC" },
      ],
    },
  ],
  widgets: [
    // --- KPI Row ---
    {
      id: "wdg_kpi_revenue",
      type: "kpi",
      title: "Total Revenue",
      description: "Gross revenue this period",
      layout: { x: 0, y: 0, w: 3, h: 2 },
      data: {
        mappings: {
          values: ["revenue"],
        },
        transforms: { aggregation: "sum" },
      },
      visualization: {
        format: { number: "currency", currency: "USD", decimals: 0 },
        comparison: {
          show: true,
          type: "previous_period",
          direction: "up_is_good",
        },
        trend: "auto",
        thresholds: [
          { value: 100000, color: "#22c55e", operator: "gte", label: "On target" },
          { value: 50000, color: "#eab308", operator: "gte", label: "Needs attention" },
          { value: 0, color: "#ef4444", operator: "lt", label: "Below target" },
        ],
        sparkline: {
          show: true,
          field: "revenue",
          color: "#3b82f6",
          fillColor: "#3b82f620",
        },
      },
    },
    {
      id: "wdg_kpi_orders",
      type: "kpi",
      title: "Orders",
      layout: { x: 3, y: 0, w: 2, h: 2 },
      data: {
        mappings: { values: ["order_count"] },
        transforms: { aggregation: "sum" },
      },
      visualization: {
        format: { number: "compact" },
        comparison: { show: true, type: "previous_period" },
        trend: "auto",
      },
    },
    {
      id: "wdg_kpi_aov",
      type: "kpi",
      title: "Avg. Order Value",
      layout: { x: 5, y: 0, w: 2, h: 2 },
      data: {
        mappings: { values: ["revenue"], comparisonField: "order_count" },
        transforms: { aggregation: "avg" },
      },
      visualization: {
        format: { number: "currency", currency: "USD", decimals: 2 },
        comparison: { show: true, type: "previous_period", direction: "up_is_good" },
      },
    },
    {
      id: "wdg_kpi_conversion",
      type: "kpi",
      title: "Conversion Rate",
      layout: { x: 7, y: 0, w: 2, h: 2 },
      data: {
        mappings: {
          values: ["conversions"],
          comparisonField: "visitors",
        },
        transforms: { aggregation: "none" },
      },
      visualization: {
        format: { number: "percentage", decimals: 1 },
        comparison: { show: true, type: "percentage" },
        thresholds: [
          { value: 5, color: "#22c55e", operator: "gte" },
          { value: 2, color: "#eab308", operator: "gte" },
          { value: 0, color: "#ef4444", operator: "lt" },
        ],
      },
    },
    {
      id: "wdg_kpi_customers",
      type: "kpi",
      title: "New Customers",
      layout: { x: 9, y: 0, w: 3, h: 2 },
      data: {
        mappings: { values: ["new_customers"] },
        transforms: { aggregation: "sum" },
      },
      visualization: {
        format: { number: "compact" },
        comparison: { show: true, type: "previous_period" },
      },
    },

    // --- Revenue Line Chart ---
    {
      id: "wdg_revenue_trend",
      type: "line",
      title: "Revenue Trend",
      description: "Daily revenue over time with 7-day rolling average",
      layout: { x: 0, y: 2, w: 6, h: 4 },
      data: {
        mappings: {
          category: "date",
          values: [
            { field: "revenue", label: "Revenue", color: "#3b82f6" },
            { field: "revenue_ma7", label: "7-day Avg", color: "#8b5cf6", type: "line" },
          ],
        },
        transforms: {
          aggregation: "none",
          orderBy: "date",
          orderDirection: "asc",
        },
        sorting: [{ field: "date", direction: "asc" }],
      },
      visualization: {
        smooth: true,
        showPoints: false,
        fillArea: false,
        lineWidth: 2,
        connectNulls: true,
        legend: { show: true, position: "top" },
        axes: {
          x: { title: "Date", format: { date: "date_short" } },
          y: {
            title: "Revenue (USD)",
            format: { number: "currency", currency: "USD", abbreviate: true },
          },
        },
        colors: ["#3b82f6", "#8b5cf6"],
      },
    },

    // --- Revenue by Category Bar Chart ---
    {
      id: "wdg_revenue_by_category",
      type: "bar",
      title: "Revenue by Product Category",
      layout: { x: 6, y: 2, w: 6, h: 4 },
      data: {
        mappings: {
          category: "category",
          values: [{ field: "revenue", label: "Revenue" }],
          groupBy: "region",
        },
        transforms: {
          aggregation: "sum",
          groupBy: ["category", "region"],
          orderBy: "revenue",
          orderDirection: "desc",
          limit: 10,
        },
      },
      visualization: {
        variant: "grouped",
        horizontal: false,
        borderRadius: 4,
        legend: { show: true, position: "bottom" },
        axes: {
          x: { title: "Category" },
          y: { format: { number: "compact" } },
        },
      },
    },

    // --- Pie: Revenue Distribution ---
    {
      id: "wdg_revenue_distribution",
      type: "pie",
      title: "Revenue Distribution by Channel",
      layout: { x: 0, y: 6, w: 4, h: 4 },
      data: {
        mappings: {
          category: "channel",
          values: ["revenue"],
          labelField: "channel",
        },
        transforms: {
          aggregation: "sum",
          groupBy: ["channel"],
          orderBy: "revenue",
          orderDirection: "desc",
          limit: 8,
        },
      },
      visualization: {
        donut: true,
        innerRadius: 40,
        outerRadius: 80,
        showLabels: true,
        labelPosition: "outside",
        showPercentages: true,
        legend: { show: true, position: "right" },
      },
    },

    // --- Area: Cumulative Metrics ---
    {
      id: "wdg_cumulative",
      type: "area",
      title: "Cumulative Growth",
      layout: { x: 4, y: 6, w: 4, h: 4 },
      data: {
        mappings: {
          category: "date",
          values: [
            { field: "cumulative_revenue", label: "Revenue" },
            { field: "cumulative_customers", label: "Customers" },
          ],
        },
        transforms: {
          aggregation: "none",
          orderBy: "date",
          orderDirection: "asc",
        },
      },
      visualization: {
        stacked: false,
        fillOpacity: 0.15,
        showPoints: false,
        legend: { show: true, position: "bottom" },
      },
    },

    // --- Table: Top Products ---
    {
      id: "wdg_top_products",
      type: "table",
      title: "Top 10 Products",
      description: "Best-selling products ranked by revenue",
      layout: { x: 8, y: 6, w: 4, h: 4 },
      data: {
        mappings: {
          values: ["product_name", "category", "units_sold", "revenue", "avg_rating"],
        },
        transforms: {
          aggregation: "sum",
          groupBy: ["product_name", "category"],
          orderBy: "revenue",
          orderDirection: "desc",
          limit: 10,
        },
        sorting: [{ field: "revenue", direction: "desc" }],
        filters: [
          {
            id: "f_min_units",
            field: "units_sold",
            operator: "greater_than",
            value: 0,
          },
        ],
      },
      visualization: {
        pagination: true,
        pageSize: 5,
        showSearch: true,
        zebra: true,
        columns: [
          { field: "product_name", header: "Product", width: 200 },
          { field: "category", header: "Category", width: 120 },
          {
            field: "units_sold",
            header: "Units Sold",
            align: "right",
            format: { number: "compact" },
          },
          {
            field: "revenue",
            header: "Revenue",
            align: "right",
            format: { number: "currency", currency: "USD" },
          },
          {
            field: "avg_rating",
            header: "Rating",
            align: "center",
            format: { number: "decimal", decimals: 1 },
          },
        ],
      },
    },
  ],
};
