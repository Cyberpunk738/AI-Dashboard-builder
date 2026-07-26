/**
 * Deterministic Document Classifier Module
 * Automatically inspects column layout, header keywords, and row data signatures
 * to classify uploaded documents into specific financial formats.
 */

export type DocumentType =
  | "Bank Statement"
  | "Transaction History"
  | "Sales Report"
  | "Expense Report"
  | "Cash Flow Report"
  | "General Ledger"
  | "Invoice"
  | "Generic CSV/Excel Dataset";

export interface ClassificationResult {
  documentType: DocumentType;
  confidenceScore: number; // 0 - 100%
  detectedFeatures: string[];
  recommendedEngine: "fintech_bank_statement" | "sales_analytics" | "general_dataset";
}

export function classifyDocumentType(
  rows: Record<string, unknown>[],
  fileName = ""
): ClassificationResult {
  if (!rows || rows.length === 0) {
    return {
      documentType: "Generic CSV/Excel Dataset",
      confidenceScore: 50,
      detectedFeatures: ["Empty dataset"],
      recommendedEngine: "general_dataset",
    };
  }

  const keys = Object.keys(rows[0]).map((k) => k.toLowerCase().replace(/[_\-\s]+/g, ""));
  const fullTextSample = (fileName + " " + keys.join(" ")).toLowerCase();
  const features: string[] = [];

  let isBankStatementScore = 0;
  let isSalesReportScore = 0;
  let isExpenseReportScore = 0;
  let isGeneralLedgerScore = 0;

  // 1. Check for Bank Statement Indicators
  const hasDate = keys.some((k) => ["date", "txndate", "valudate", "bookingdate", "postdate"].some((kw) => k.includes(kw)));
  const hasDebit = keys.some((k) => ["debit", "withdrawal", "dr", "outflow", "spent"].some((kw) => k.includes(kw)));
  const hasCredit = keys.some((k) => ["credit", "deposit", "cr", "inflow", "received"].some((kw) => k.includes(kw)));
  const hasBalance = keys.some((k) => ["balance", "runningbalance", "closingbalance", "availablebalance"].some((kw) => k.includes(kw)));
  const hasDescription = keys.some((k) => ["description", "narration", "particulars", "remarks", "payee", "merchant", "vendor"].some((kw) => k.includes(kw)));

  if (hasDate) { isBankStatementScore += 20; features.push("Date column detected"); }
  if (hasDescription) { isBankStatementScore += 20; features.push("Payee/Narration column detected"); }
  if (hasDebit && hasCredit) { isBankStatementScore += 30; features.push("Separate Debit & Credit columns"); }
  if (hasBalance) { isBankStatementScore += 30; features.push("Running Balance column detected"); }

  if (fullTextSample.includes("statement") || fullTextSample.includes("bank") || fullTextSample.includes("piggyvest") || fullTextSample.includes("opay") || fullTextSample.includes("gtbank") || fullTextSample.includes("zenith")) {
    isBankStatementScore += 20;
    features.push("Bank/Statement keywords in file headers");
  }

  // 2. Check for Sales Report Indicators
  const hasOrder = keys.some((k) => ["order", "orderid", "invoice", "receipt", "customer"].some((kw) => k.includes(kw)));
  const hasQuantity = keys.some((k) => ["qty", "quantity", "units", "unitsold"].some((kw) => k.includes(kw)));
  const hasRevenue = keys.some((k) => ["revenue", "sales", "price", "unitprice", "totalprice"].some((kw) => k.includes(kw)));

  if (hasOrder) { isSalesReportScore += 35; features.push("Order/Customer tracking"); }
  if (hasQuantity) { isSalesReportScore += 35; features.push("Unit Quantity tracking"); }
  if (hasRevenue) { isSalesReportScore += 30; features.push("Revenue/Sales Price tracking"); }

  // 3. Check for Expense Report Indicators
  const hasEmployee = keys.some((k) => ["employee", "staff", "claimant", "department"].some((kw) => k.includes(kw)));
  const hasCategory = keys.some((k) => ["category", "expensetype", "costCenter"].some((kw) => k.includes(kw)));

  if (hasEmployee) { isExpenseReportScore += 40; features.push("Employee/Staff field"); }
  if (hasCategory && hasDebit) { isExpenseReportScore += 40; features.push("Expense Category classification"); }

  // 4. Check for General Ledger Indicators
  const hasAccountCode = keys.some((k) => ["accountcode", "accountnum", "glcode", "chartofaccounts", "journal"].some((kw) => k.includes(kw)));
  if (hasAccountCode) { isGeneralLedgerScore += 60; features.push("GL Account Code classification"); }

  // Classification Decision Matrix
  if (isBankStatementScore >= 60 || (hasDate && (hasDebit || hasCredit || hasBalance))) {
    return {
      documentType: hasBalance ? "Bank Statement" : "Transaction History",
      confidenceScore: Math.min(100, isBankStatementScore),
      detectedFeatures: features,
      recommendedEngine: "fintech_bank_statement",
    };
  }

  if (isSalesReportScore >= 60) {
    return {
      documentType: "Sales Report",
      confidenceScore: Math.min(100, isSalesReportScore),
      detectedFeatures: features,
      recommendedEngine: "sales_analytics",
    };
  }

  if (isExpenseReportScore >= 60) {
    return {
      documentType: "Expense Report",
      confidenceScore: Math.min(100, isExpenseReportScore),
      detectedFeatures: features,
      recommendedEngine: "fintech_bank_statement",
    };
  }

  if (isGeneralLedgerScore >= 60) {
    return {
      documentType: "General Ledger",
      confidenceScore: Math.min(100, isGeneralLedgerScore),
      detectedFeatures: features,
      recommendedEngine: "fintech_bank_statement",
    };
  }

  return {
    documentType: "Generic CSV/Excel Dataset",
    confidenceScore: 70,
    detectedFeatures: features.length > 0 ? features : ["General tabular format"],
    recommendedEngine: "general_dataset",
  };
}
