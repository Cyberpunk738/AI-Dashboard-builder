import type {
  Command,
  CommandResult,
  UpdateWidgetPayload,
  AddWidgetPayload,
  RemoveWidgetPayload,
  DuplicateWidgetPayload,
  UpdateLayoutPayload,
  SetDashboardTitlePayload,
} from "./types";

// ============================================================
// Minimal interface for store actions consumed by the executor
// ============================================================

export interface DashboardActions {
  addWidget: (
    type: string,
    partial?: Record<string, unknown>
  ) => string;
  updateWidget: (id: string, patch: Record<string, unknown>) => void;
  removeWidget: (id: string) => void;
  duplicateWidget: (id: string) => void;
  setDashboardTitle?: (title: string) => void;
}

// ============================================================
// Executor: validated Command → store mutation
// ============================================================

export function executeCommand(
  command: Command,
  store: DashboardActions
): CommandResult {
  try {
    switch (command.type) {
      case "UPDATE_WIDGET":
        return executeUpdateWidget(command.payload as UpdateWidgetPayload, store);
      case "ADD_WIDGET":
        return executeAddWidget(command.payload as AddWidgetPayload, store);
      case "REMOVE_WIDGET":
        return executeRemoveWidget(command.payload as RemoveWidgetPayload, store);
      case "DUPLICATE_WIDGET":
        return executeDuplicateWidget(command.payload as DuplicateWidgetPayload, store);
      case "UPDATE_LAYOUT":
        return executeUpdateLayout(command.payload as UpdateLayoutPayload, store);
      case "SET_DASHBOARD_TITLE":
        return executeSetTitle(command.payload as SetDashboardTitlePayload, store);
      default:
        return {
          success: false,
          error: `Unknown command type`,
          code: "UNKNOWN_TYPE",
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Execution error",
      code: "EXECUTION_ERROR",
    };
  }
}

export function executeCommands(
  commands: Command[],
  store: DashboardActions
): CommandResult[] {
  return commands.map((cmd) => executeCommand(cmd, store));
}

// ── Individual executors ──

function executeUpdateWidget(
  payload: UpdateWidgetPayload,
  store: DashboardActions
): CommandResult {
  const { id, ...changes } = payload;
  store.updateWidget(id, changes as Parameters<typeof store.updateWidget>[1]);

  const changed: string[] = [];
  if (changes.title) changed.push("title");
  if (changes.type) changed.push("type");
  if (changes.data) changed.push("data");
  if (changes.layout) changed.push("layout");
  if (changes.visualization) changed.push("visualization");

  return {
    success: true,
    description: `Updated widget "${changes.title ?? id}": ${changed.join(", ")}`,
    widgetId: id,
  };
}

function executeAddWidget(
  payload: AddWidgetPayload,
  store: DashboardActions
): CommandResult {
  const id = store.addWidget(
    payload.type,
    payload as unknown as Parameters<typeof store.addWidget>[1]
  );

  return {
    success: true,
    description: `Added ${payload.type} chart${payload.title ? `: "${payload.title}"` : ""}`,
    widgetId: id,
  };
}

function executeRemoveWidget(
  payload: RemoveWidgetPayload,
  store: DashboardActions
): CommandResult {
  store.removeWidget(payload.id);
  return {
    success: true,
    description: `Removed widget "${payload.id}"`,
    widgetId: payload.id,
  };
}

function executeDuplicateWidget(
  payload: DuplicateWidgetPayload,
  store: DashboardActions
): CommandResult {
  store.duplicateWidget(payload.id);
  return {
    success: true,
    description: `Duplicated widget "${payload.id}"`,
    widgetId: payload.id,
  };
}

function executeUpdateLayout(
  payload: UpdateLayoutPayload,
  store: DashboardActions
): CommandResult {
  const { id, ...layout } = payload;
  store.updateWidget(id, {
    layout: layout as Parameters<typeof store.updateWidget>[1]["layout"],
  } as Parameters<typeof store.updateWidget>[1]);
  return {
    success: true,
    description: `Updated layout for widget "${id}"`,
    widgetId: id,
  };
}

function executeSetTitle(
  payload: SetDashboardTitlePayload,
  store: DashboardActions
): CommandResult {
  store.setDashboardTitle?.(payload.title);
  return {
    success: true,
    description: `Dashboard title set to "${payload.title}"`,
  };
}
