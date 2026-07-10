import Papa from "papaparse";

export interface ParseResult {
  columns: string[];
  rows: Record<string, unknown>[];
  errors: string[];
}

export function parseCSV(
  file: File
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
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
      complete: (results) => {
        resolve({
          columns: results.meta.fields ?? [],
          rows: results.data as Record<string, unknown>[],
          errors: results.errors.map((e) => e.message),
        });
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export function inferColumnType(
  values: unknown[]
): "number" | "string" | "date" | "boolean" {
  const nonNull = values.filter((v) => v != null);

  if (nonNull.length === 0) return "string";

  const typeCounts = { number: 0, string: 0, date: 0, boolean: 0 };

  for (const val of nonNull) {
    if (typeof val === "boolean") {
      typeCounts.boolean++;
    } else if (typeof val === "number") {
      typeCounts.number++;
    } else if (typeof val === "string") {
      if (
        !isNaN(Date.parse(val as string)) &&
        !/^\d+$/.test(val as string)
      ) {
        typeCounts.date++;
      } else if (
        ["true", "false", "yes", "no", "1", "0"].includes(
          (val as string).toLowerCase()
        )
      ) {
        typeCounts.boolean++;
      } else {
        typeCounts.string++;
      }
    } else {
      typeCounts.string++;
    }
  }

  const maxType = Object.entries(typeCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  return maxType as "number" | "string" | "date" | "boolean";
}
