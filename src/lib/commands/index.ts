export type {
  Command,
  CommandType,
  CommandPayload,
  CommandResult,
  CommandSuccess,
  CommandError,
  ValidationContext,
  ParseResult,
  UpdateWidgetPayload,
  AddWidgetPayload,
  RemoveWidgetPayload,
  DuplicateWidgetPayload,
  UpdateLayoutPayload,
  SetDashboardTitlePayload,
} from "./types";

export {
  CommandSchemas,
  VALID_COMMAND_TYPES,
  UpdateWidgetPayloadSchema,
  AddWidgetPayloadSchema,
  RemoveWidgetPayloadSchema,
  DuplicateWidgetPayloadSchema,
  UpdateLayoutPayloadSchema,
  SetDashboardTitlePayloadSchema,
} from "./schemas";

export {
  validateCommand,
  validateCommands,
} from "./validator";
export type { ValidationResult } from "./validator";

export {
  executeCommand,
  executeCommands,
} from "./executor";
export type { DashboardActions } from "./executor";

export {
  buildParsePrompt,
  parseNaturalLanguage,
} from "./parser";
