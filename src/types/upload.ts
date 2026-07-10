export type UploadFileType = "csv" | "xlsx";

export interface UploadedColumn {
  name: string;
  type: "number" | "string" | "date" | "boolean";
  nullable: boolean;
  nullCount: number;
  uniqueCount: number;
  sampleValues: unknown[];
  min?: number | string;
  max?: number | string;
  mean?: number;
}

export interface UploadResult {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: UploadFileType;
  rowCount: number;
  columns: UploadedColumn[];
  rows: Record<string, unknown>[];
  parseErrors: string[];
  parsedAt: string;
}

export interface UploadProgress {
  percent: number;
  bytesLoaded: number;
  bytesTotal: number;
  stage: "validating" | "parsing" | "analyzing" | "complete";
}

export interface UploadError {
  code:
    | "INVALID_TYPE"
    | "FILE_TOO_LARGE"
    | "PARSE_ERROR"
    | "EMPTY_FILE"
    | "TOO_MANY_ROWS";
  message: string;
  details?: unknown;
}

export type UploadState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "parsing"; progress: UploadProgress }
  | { status: "analyzing"; progress: UploadProgress }
  | { status: "complete"; result: UploadResult }
  | { status: "error"; error: UploadError };

export interface FileDropzoneProps {
  onUploadComplete: (result: UploadResult) => void;
  onUploadError?: (error: UploadError) => void;
  onProgress?: (progress: UploadProgress) => void;
  accept?: string[];
  maxSize?: number;
  maxRows?: number;
  disabled?: boolean;
  className?: string;
}

export const DEFAULT_ACCEPT = [
  ".csv",
  ".xlsx",
  ".xls",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

export const DEFAULT_MAX_SIZE = 50;
export const DEFAULT_MAX_ROWS = 500_000;
