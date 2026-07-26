/**
 * Production-Grade Financial Data Validation Engine
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
  const seenTxSignatures = new Map<string, number>();

  let duplicateRowCount = 0;
  let balanceMathDiscrepancies = 0;
  let invalidDateCount = 0;
  let impossibleValueCount = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    let isRowValid = true;

    // 1. Date Validation
    const dateVal = r.Date ?? r.date ?? r.Sleep_Day ?? r.txn_date ?? r.TransactionDate ?? r.BookingDate;
    if (!dateVal || dateVal === "" || dateVal === "Invalid Date") {
      invalidDateCount++;
      isRowValid = false;
      flaggedRows.push({
        rowIndex: idx + 1,
        rawRecord: r,
        issueType: "invalid_date",
        severity: "critical",
        description: `Row ${idx + 1} contains missing or unparseable date value: "${dateVal}".`,
      });
    }

    // 2. Numeric Sanity (Debit / Credit / Amount)
    const getNum = (val: unknown): number => {
      if (val === null || val === undefined || val === "" || val === "-") return NaN;
      const cleaned = String(val).replace(/[,\s]/g, "").replace(/[()]/g, "");
      return Number(cleaned);
    };

    const amt = getNum(r.Amount ?? r.amount);
    const debit = getNum(r.Debit ?? r.debit);
    const credit = getNum(r.Credit ?? r.credit);

    if (isNaN(amt) && isNaN(debit) && isNaN(credit)) {
      impossibleValueCount++;
      isRowValid = false;
      flaggedRows.push({
        rowIndex: idx + 1,
        rawRecord: r,
        issueType: "impossible_value",
        severity: "critical",
        description: `Row ${idx + 1} has no valid numeric amount, debit, or credit values.`,
      });
    }

    // Check for impossible negative debits/credits
    if ((!isNaN(debit) && debit < 0) || (!isNaN(credit) && credit < 0)) {
      impossibleValueCount++;
      flaggedRows.push({
        rowIndex: idx + 1,
        rawRecord: r,
        issueType: "impossible_value",
        severity: "warning",
        description: `Row ${idx + 1} contains negative debit (${debit}) or credit (${credit}) amounts.`,
      });
    }

    // 3. Duplicate Transaction Detection (Date + Payee + Amount + Type)
    const descStr = String(r.Description ?? r.description ?? r.Payee ?? r.Vendor ?? "").trim().toLowerCase();
    const sigAmt = !isNaN(credit) && credit > 0 ? credit : !isNaN(debit) && debit > 0 ? debit : amt;
    const txSig = `${dateVal}_${descStr}_${sigAmt}`;

    if (seenTxSignatures.has(txSig)) {
      duplicateRowCount++;
      flaggedRows.push({
        rowIndex: idx + 1,
        rawRecord: r,
        issueType: "duplicate_transaction",
        severity: "warning",
        description: `Row ${idx + 1} is an exact duplicate of row ${seenTxSignatures.get(txSig)! + 1} ("${descStr}", ${sigAmt}).`,
      });
    } else {
      seenTxSignatures.set(txSig, idx);
    }

    // 4. Sequential Balance Verification (if Balance column is present)
    const balance = getNum(r.Balance ?? r.balance ?? r.RunningBalance);
    if (idx > 0 && !isNaN(balance)) {
      const prevRow = rows[idx - 1];
      const prevBal = getNum(prevRow.Balance ?? prevRow.balance ?? prevRow.RunningBalance);
      if (!isNaN(prevBal)) {
        let expectedBal = prevBal;
        if (!isNaN(credit) && credit > 0) expectedBal += credit;
        else if (!isNaN(debit) && debit > 0) expectedBal -= debit;
        else if (!isNaN(amt)) expectedBal += amt;

        // Allow 0.05 rounding tolerance
        if (Math.abs(balance - expectedBal) > 0.05) {
          balanceMathDiscrepancies++;
          flaggedRows.push({
            rowIndex: idx + 1,
            rawRecord: r,
            issueType: "balance_mismatch",
            severity: "warning",
            description: `Row ${idx + 1} balance math mismatch: reported ${balance}, expected ${expectedBal.toFixed(2)} (diff: ${(balance - expectedBal).toFixed(2)}).`,
          });
        }
      }
    }

    if (isRowValid) {
      cleanRows.push(r);
    }
  }

  // 5. Data Quality Score Calculation
  const totalRows = rows.length;
  const criticalCount = flaggedRows.filter((f) => f.severity === "critical").length;
  const warningCount = flaggedRows.filter((f) => f.severity === "warning").length;

  // Deduct 5 points per critical error, 1 point per warning error
  const penalty = (criticalCount * 5 + warningCount * 1) / Math.max(1, totalRows / 20);
  const dataQualityScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  let qualityGrade: "A+" | "A" | "B" | "C" | "F" = "A+";
  if (dataQualityScore >= 95) qualityGrade = "A+";
  else if (dataQualityScore >= 85) qualityGrade = "A";
  else if (dataQualityScore >= 70) qualityGrade = "B";
  else if (dataQualityScore >= 50) qualityGrade = "C";
  else qualityGrade = "F";

  return {
    cleanRows: cleanRows.length > 0 ? cleanRows : rows, // fallback to raw rows if all flagged
    report: {
      totalRows,
      validRowCount: cleanRows.length,
      flaggedRowCount: flaggedRows.length,
      duplicateRowCount,
      balanceMathDiscrepancies,
      invalidDateCount,
      impossibleValueCount,
      dataQualityScore,
      qualityGrade,
      flaggedRows: flaggedRows.slice(0, 20), // top 20 flagged
    },
  };
}
