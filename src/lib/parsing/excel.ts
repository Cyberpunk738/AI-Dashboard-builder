import * as XLSX from "xlsx";
import type { ParseResult } from "./csv";

export function parseExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
          defval: null,
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
