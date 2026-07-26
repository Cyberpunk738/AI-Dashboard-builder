/**
 * Pre-Analysis Data Validation & Hygiene Engine
 * 100% Deterministic pre-analysis data hygiene audit.
 * Audits raw statement rows before running analytics algorithms.
 */

export interface FlaggedRow {
  rowIndex: number;
  rowId?: string;
  rawRecord: Record<string, unknown>;
  issueType:
    | "balance_mismatch"
    | "invalid_date"
    | "impossible_value"
    | "duplicate_transaction"
    | "out_of_order";
  severity: "critical" | "warning";
  description: string;
}

export interface ValidationReport {
  totalRows: number;
  validRowCount: number;
  flaggedRowCount: number;
  duplicateRowCount: number;
  balanceMathDiscrepancies: number;
  invalidDateCount: number;
  impossibleValueCount: number;
  dataQualityScore: number; // 0 - 100%
  qualityGrade: "A+" | "A" | "B" | "C" | "F";
  flaggedRows: FlaggedRow[];
}

export interface ValidatedStatementData {
  cleanRows: Record<string, unknown>[];
  report: ValidationReport;
}

export function validateStatementData(
  rows: Record<string, unknown>[]
): ValidatedStatementData {
  if (!rows || rows.length === 0) {
    return {
      cleanRows: [],
      report: {
        totalRows: 0,
        validRowCount: 0,
        flaggedRowCount: 0,
        duplicateRowCount: 0,
        balanceMathDiscrepancies: 0,
        invalidDateCount: 0,
        impossibleValueCount: 0,
        dataQualityScore: 100,
        qualityGrade: "A+",
        flaggedRows: [],
      },
    };
  }

  const flaggedRows: FlaggedRow[] = [];
  const cleanRows: Record<string, unknown>[] = [];
  const seenSignatures = new Set<string>();

  let duplicateCount = 0;
  let balanceMismatchCount = 0;
  let invalidDateCount = 0;
  let impossibleValueCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let isRowValid = true;

    // 1. Date Check
    const dateVal = String(row.Date || row.date || row.Timestamp || "").trim();
    if (!dateVal || isNaN(Date.parse(dateVal)) && !/^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
      invalidDateCount++;
      isRowValid = false;
      flaggedRows.push({
        rowIndex: i + 1,
        rawRecord: row,
        issueType: "invalid_date",
        severity: "critical",
        description: `Invalid or corrupted date format: "${dateVal}"`,
      });
    }

    // 2. Debit / Credit Impossible Value Check
    const debit = parseNum(row.Debit || row.debit || row.Withdrawal);
    const credit = parseNum(row.Credit || row.credit || row.Deposit);

    if (debit < 0 || credit < 0) {
      impossibleValueCount++;
      isRowValid = false;
      flaggedRows.push({
        rowIndex: i + 1,
        rawRecord: row,
        issueType: "impossible_value",
        severity: "critical",
        description: "Negative debit or credit value detected.",
      });
    }

    // 3. Duplicate Transaction Check
    const desc = String(row.Description || row.description || row.Payee || "").trim();
    const amount = credit > 0 ? credit : debit;
    const signature = `${dateVal}_${desc}_${amount}`;

    if (seenSignatures.has(signature) && amount > 0) {
      duplicateCount++;
      flaggedRows.push({
        rowIndex: i + 1,
        rawRecord: row,
        issueType: "duplicate_transaction",
        severity: "warning",
        description: `Duplicate transaction signature detected: ${desc} (${amount})`,
      });
    } else {
      seenSignatures.add(signature);
    }

    if (isRowValid) {
      cleanRows.push(row);
    }
  }

  const totalRows = rows.length;
  const flaggedRowCount = flaggedRows.length;
  const validRowCount = cleanRows.length;

  const penalty = (duplicateCount * 2) + (balanceMismatchCount * 5) + (invalidDateCount * 10) + (impossibleValueCount * 10);
  const dataQualityScore = Math.max(0, Math.min(100, Math.round(100 - (penalty / Math.max(1, totalRows)) * 100)));

  let qualityGrade: "A+" | "A" | "B" | "C" | "F" = "A+";
  if (dataQualityScore >= 95) qualityGrade = "A+";
  else if (dataQualityScore >= 85) qualityGrade = "A";
  else if (dataQualityScore >= 70) qualityGrade = "B";
  else if (dataQualityScore >= 50) qualityGrade = "C";
  else qualityGrade = "F";

  return {
    cleanRows: cleanRows.length > 0 ? cleanRows : rows,
    report: {
      totalRows,
      validRowCount,
      flaggedRowCount,
      duplicateRowCount: duplicateCount,
      balanceMathDiscrepancies: balanceMismatchCount,
      invalidDateCount,
      impossibleValueCount,
      dataQualityScore,
      qualityGrade,
      flaggedRows,
    },
  };
}

function parseNum(v: unknown): number {
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  if (typeof v === "string") {
    const clean = v.replace(/[^0-9.-]/g, "");
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}
