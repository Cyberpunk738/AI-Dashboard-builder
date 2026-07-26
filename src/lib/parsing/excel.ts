import * as XLSX from "xlsx";
import type { ParseResult } from "./csv";

export function parseExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true, cellFormula: false });

        let bestSheetName = workbook.SheetNames[0];
        let bestRows: Record<string, unknown>[] = [];
        let bestColumns: string[] = [];

        // Iterate through sheet names to find the best table sheet
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });

          if (!matrix || matrix.length === 0) continue;

          // Search first 30 rows for the actual table header row
          let headerRowIndex = 0;
          let maxMatches = 0;

          const HEADER_KEYWORDS = [
            "date", "time", "period", "timestamp",
            "desc", "description", "narration", "particulars", "details", "payee", "remarks",
            "debit", "credit", "amount", "withdrawal", "deposit", "balance", "dr", "cr"
          ];

          for (let r = 0; r < Math.min(30, matrix.length); r++) {
            const rowStr = (matrix[r] || []).map((c) => String(c || "").toLowerCase().trim()).join(" ");
            let matches = 0;
            for (const kw of HEADER_KEYWORDS) {
              if (rowStr.includes(kw)) matches++;
            }
            if (matches > maxMatches) {
              maxMatches = matches;
              headerRowIndex = r;
            }
          }

          // Build row objects using detected header row
          const headerRow = (matrix[headerRowIndex] || []).map((c, i) => String(c || "").trim() || `Column_${i + 1}`);
          const dataRows: Record<string, unknown>[] = [];

          for (let r = headerRowIndex + 1; r < matrix.length; r++) {
            const rawCells = matrix[r] || [];
            // Skip empty rows
            if (!rawCells || rawCells.every((c) => c === "" || c == null)) continue;

            const rowObj: Record<string, unknown> = {};
            let hasValue = false;

            headerRow.forEach((colName, colIdx) => {
              let val = rawCells[colIdx];
              // Format Excel serial dates if any
              if (typeof val === "number" && val > 30000 && val < 60000 && colName.toLowerCase().includes("date")) {
                val = formatExcelDate(val);
              } else if (val instanceof Date) {
                val = val.toISOString().split("T")[0];
              }
              rowObj[colName] = val;
              if (val !== "" && val != null) hasValue = true;
            });

            if (hasValue) {
              dataRows.push(rowObj);
            }
          }

          if (dataRows.length > bestRows.length) {
            bestRows = dataRows;
            bestColumns = headerRow;
            bestSheetName = sheetName;
          }
        }

        resolve({ columns: bestColumns, rows: bestRows, errors: [] });
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Failed to parse Excel statement file")
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read Excel file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

function formatExcelDate(serial: number): string {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  return dateInfo.toISOString().split("T")[0];
}
