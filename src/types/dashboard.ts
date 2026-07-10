// Re-export the new schema types for backward compatibility.
// All types are defined in dashboard-schema.ts going forward.

export type {
  WidgetLayout,
  GridLayout,
  FilterOperator,
  WidgetFilter,
  SortDirection,
  WidgetSorting,
  ChartSeries,
  DataMapping,
  DataTransform,
  NumberFormatType,
  DateFormatType,
  ValueFormat,
  AxisConfig,
  LegendConfig,
  BarVisualization,
  LineVisualization,
  PieVisualization,
  AreaVisualization,
  TableColumnConfig,
  TableVisualization,
  KpiVisualization,
  Threshold,
  WidgetVisualization,
  WidgetDataConfig,
  WidgetType,
  WidgetConfig,
  DashboardVariable,
  DashboardMetadata,
  DashboardConfig,
  WidgetProps,
  WidgetTypeMap,
} from "./dashboard-schema";

export {
  getVisualization,
  getDefaultLayout,
  SUPPORTED_WIDGET_TYPES,
} from "./dashboard-schema";
