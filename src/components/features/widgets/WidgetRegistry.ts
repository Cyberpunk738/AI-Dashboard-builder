import { lazy, type ComponentType } from "react";
import type { WidgetConfig, WidgetProps, WidgetType } from "@/types/dashboard";

type WidgetLoader = () => Promise<{ default: ComponentType<WidgetProps> }>;

const registry = new Map<WidgetType, WidgetLoader>();

function register(type: WidgetType, loader: WidgetLoader) {
  registry.set(type, loader);
}

register("bar", () => import("./charts/BarChartWidget"));
register("line", () => import("./charts/LineChartWidget"));
register("pie", () => import("./charts/PieChartWidget"));
register("area", () => import("./charts/AreaChartWidget"));
register("table", () => import("./TableWidget"));
register("kpi", () => import("./StatWidget"));

export function getWidgetComponent(type: string): ComponentType<WidgetProps> | null {
  const loader = registry.get(type as WidgetType);
  if (!loader) return null;
  return lazy(loader);
}

export function getWidgetModule(type: string) {
  return registry.get(type as WidgetType) ?? null;
}

export function isRegistered(type: string): boolean {
  return registry.has(type as WidgetType);
}

export function getRegisteredTypes(): WidgetType[] {
  return Array.from(registry.keys());
}

export function registerWidgetType(type: WidgetType, loader: WidgetLoader) {
  register(type, loader);
}

export default registry;
