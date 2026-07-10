import { nanoid } from "nanoid";

export const generateId = (prefix = "w"): string =>
  `${prefix}_${nanoid(8)}`;

export const generateDashboardId = (): string => generateId("db");
export const generateWidgetId = (): string => generateId("wdg");
export const generateMessageId = (): string => generateId("msg");
