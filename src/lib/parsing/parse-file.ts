import Papa from "papaparse";
import * as XLSX from "xlsx";
import { nanoid } from "nanoid";
import type {
  UploadResult,
  UploadedColumn,
  UploadProgress,
  UploadError,
  UploadFileType,
} from "@/types/upload";

const ACCEPTED_EXTENSIONS = ["csv", "xlsx", "xls"];
const PREVIEW_SAMPLE_SIZE = 5;

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function validateFile(
  file: File,
  accept?: string[],
  maxSize?: number,
  maxRows?: number
): UploadError | null {
  const ext = getExtension(file.name);
  const mime = file.type;

  const allowed = accept ?? [
    ".csv",
    ".xlsx",
    ".xls",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const extOk = allowed.some(
    (a) =>
      a === `.${ext}` ||
      a === mime ||
      a === `application/${ext}`
  );

  if (!extOk && !ACCEPTED_EXTENSIONS.includes(ext)) {
    return {
      code: "INVALID_TYPE",
      message: `Unsupported file type ".${ext}". Please upload CSV or Excel files.`,
    };
  }

  const max = maxSize ?? 50;
  if (file.size > max * 1024 * 1024) {
    return {
      code: "FILE_TOO_LARGE",
      message: `File is ${(file.size / 1024 / 1024).toFixed(1)}MB, maximum is ${max}MB.`,
    };
  }

  if (file.size === 0) {
    return {
      code: "EMPTY_FILE",
      message: "The file appears to be empty.",
    };
  }

  return null;
}

function inferType(values: unknown[]): UploadedColumn["type"] {
  const nonNull = values.filter((v) => v != null);
  if (nonNull.length === 0) return "string";

  const scores = { number: 0, string: 0, date: 0, boolean: 0 };

  for (const val of nonNull) {
    if (typeof val === "boolean") {
      scores.boolean++;
    } else if (typeof val === "number") {
      scores.number++;
    } else if (typeof val === "string") {
      const str = val.trim().toLowerCase();
      if (["true", "false", "yes", "no"].includes(str)) {
        scores.boolean++;
      } else if (
        !isNaN(Date.parse(str)) &&
        !/^\d{1,4}$/.test(str)
      ) {
        scores.date++;
      } else if (!isNaN(Number(str))) {
        scores.number++;
      } else {
        scores.string++;
      }
    } else {
      scores.string++;
    }
  }

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as UploadedColumn["type"];
}

function analyzeColumns(
  rows: Record<string, unknown>[]
): UploadedColumn[] {
  if (rows.length === 0) return [];

  const keys = Object.keys(rows[0]);

  return keys.map((name) => {
    const values = rows.map((r) => r[name]);
    const nullCount = values.filter((v) => v == null).length;
    const nonNull = values.filter((v) => v != null);
    const unique = new Set(nonNull.map((v) => String(v)));
    const type = inferType(values);
    const sampleValues = nonNull.slice(0, PREVIEW_SAMPLE_SIZE);

    const column: UploadedColumn = {
      name,
      type,
      nullable: nullCount > 0,
      nullCount,
      uniqueCount: unique.size,
      sampleValues,
    };

    if (type === "number") {
      const nums = nonNull.filter(
        (v): v is number => typeof v === "number"
      );
      if (nums.length > 0) {
        column.min = Math.min(...nums);
        column.max = Math.max(...nums);
        column.mean =
          nums.reduce((a, b) => a + b, 0) / nums.length;
      }
    }

    if (type === "date") {
      const dates = nonNull
        .map((v) => new Date(String(v)))
        .filter((d) => !isNaN(d.getTime()));
      if (dates.length > 0) {
        const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
        column.min = sorted[0].toISOString();
        column.max = sorted[sorted.length - 1].toISOString();
      }
    }

    return column;
  });
}

function estimateCSVRowCount(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const firstNewline = text.indexOf("\n");
      if (firstNewline === -1) {
        resolve(0);
        return;
      }
      const headerLen = firstNewline + 1;
      const avgRowBytes = headerLen;
      resolve(Math.max(0, Math.ceil((file.size - headerLen) / avgRowBytes)));
    };
    reader.onerror = () => reject(new Error("Failed to estimate row count"));
    const chunk = file.slice(0, Math.min(file.size, 65536));
    reader.readAsText(chunk);
  });
}

function parseCSVWithProgress(
  file: File,
  onProgress: (p: UploadProgress) => void
): Promise<{ columns: string[]; rows: Record<string, unknown>[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const rows: Record<string, unknown>[] = [];
    const errors: string[] = [];
    let estimatedTotal = 0;
    let parsedBytes = 0;

    estimateCSVRowCount(file)
      .then((estimated) => {
        estimatedTotal = estimated;

        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transform: (value: string) => {
            const trimmed = value.trim();
            if (trimmed === "" || trimmed === "NULL" || trimmed === "null") {
              return null;
            }
            return trimmed;
          },
          chunk: (results, parser) => {
            rows.push(
              ...(results.data as Record<string, unknown>[])
            );
            results.errors.forEach((e) =>
              errors.push(`Row ${e.row}: ${e.message}`)
            );

            parsedBytes += Math.round(
              (results.data.length / Math.max(estimatedTotal, 1)) *
                file.size
            );

            const percent = estimatedTotal > 0
              ? Math.min(95, Math.round((rows.length / estimatedTotal) * 100))
              : Math.min(95, Math.round((parsedBytes / file.size) * 100));

            onProgress({
              percent,
              bytesLoaded: Math.min(parsedBytes, file.size),
              bytesTotal: file.size,
              stage: "parsing",
            });

            if (rows.length > 500_000) {
              parser.abort();
              errors.push("Parse aborted: file exceeds 500,000 row limit");
            }
          },
          complete: () => {
            const columns =
              rows.length > 0 ? Object.keys(rows[0]) : [];
            resolve({ columns, rows, errors });
          },
          error: (error) => {
            reject(new Error(error.message));
          },
        });
      })
      .catch(reject);
  });
}

function parseExcelFile(
  file: File,
  onProgress: (p: UploadProgress) => void
): Promise<{ columns: string[]; rows: Record<string, unknown>[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    onProgress({
      percent: 10,
      bytesLoaded: 0,
      bytesTotal: file.size,
      stage: "parsing",
    });

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress({
          percent: Math.round((e.loaded / e.total) * 80),
          bytesLoaded: e.loaded,
          bytesTotal: e.total,
          stage: "parsing",
        });
      }
    };

    reader.onload = (e) => {
      onProgress({
        percent: 85,
        bytesLoaded: file.size,
        bytesTotal: file.size,
        stage: "parsing",
      });

      try {
        const data = new Uint8Array(
          e.target?.result as ArrayBuffer
        );
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true,
        });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          defval: null,
          raw: false,
        });

        const rows = jsonData as Record<string, unknown>[];
        const columns =
          rows.length > 0 ? Object.keys(rows[0]) : [];

        resolve({ columns, rows, errors: [] });
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Failed to parse Excel file")
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

export async function parseFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  options?: {
    accept?: string[];
    maxSize?: number;
    maxRows?: number;
  }
): Promise<UploadResult> {
  const emitProgress = (p: UploadProgress) => onProgress?.(p);

  emitProgress({
    percent: 0,
    bytesLoaded: 0,
    bytesTotal: file.size,
    stage: "validating",
  });

  const validationError = validateFile(
    file,
    options?.accept,
    options?.maxSize,
    options?.maxRows
  );

  if (validationError) {
    throw validationError;
  }

  emitProgress({
    percent: 5,
    bytesLoaded: 0,
    bytesTotal: file.size,
    stage: "parsing",
  });

  const ext = getExtension(file.name);
  const isExcel = ext === "xlsx" || ext === "xls";

  const parsed = isExcel
    ? await parseExcelFile(file, emitProgress)
    : await parseCSVWithProgress(file, emitProgress);

  emitProgress({
    percent: 96,
    bytesLoaded: file.size,
    bytesTotal: file.size,
    stage: "analyzing",
  });

  const columns = analyzeColumns(parsed.rows);

  if (parsed.rows.length === 0) {
    throw {
      code: "EMPTY_FILE",
      message:
        "No data rows found in the file. Check that it has a header row.",
    } satisfies UploadError;
  }

  const result: UploadResult = {
    id: nanoid(),
    fileName: file.name,
    fileSize: file.size,
    fileType: ext as UploadFileType,
    rowCount: parsed.rows.length,
    columns,
    rows: parsed.rows,
    parseErrors: parsed.errors,
    parsedAt: new Date().toISOString(),
  };

  emitProgress({
    percent: 100,
    bytesLoaded: file.size,
    bytesTotal: file.size,
    stage: "complete",
  });

  return result;
}
