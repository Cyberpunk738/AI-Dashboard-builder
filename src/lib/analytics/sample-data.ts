import type { Dataset } from "@/types/dataset";
import type { UploadResult } from "@/types/upload";

export const SAMPLE_BANK_STATEMENT_ROWS: Record<string, unknown>[] = [
  { Date: "2026-02-01", Description: "TechCorp Payroll / Salary Deposit", Debit: "", Credit: "750000.00", Balance: "750000.00" },
  { Date: "2026-02-02", Description: "Tesco Supermarket Groceries", Debit: "45250.00", Credit: "", Balance: "704750.00" },
  { Date: "2026-02-03", Description: "Uber Trip Ride London", Debit: "12400.00", Credit: "", Balance: "692350.00" },
  { Date: "2026-02-04", Description: "Netflix Monthly Subscription", Debit: "4500.00", Credit: "", Balance: "687850.00" },
  { Date: "2026-02-05", Description: "Starbucks Coffee Shop", Debit: "3200.00", Credit: "", Balance: "684650.00" },
  { Date: "2026-02-06", Description: "Transfer to Savings Vault Safelock", Debit: "150000.00", Credit: "", Balance: "534650.00" },
  { Date: "2026-02-08", Description: "Freelance Consulting Payment", Debit: "", Credit: "120000.00", Balance: "654650.00" },
  { Date: "2026-02-10", Description: "ATM Cash Withdrawal Victoria", Debit: "20000.00", Credit: "", Balance: "634650.00" },
  { Date: "2026-02-12", Description: "Shell Petrol Station Fuel", Debit: "18500.00", Credit: "", Balance: "616150.00" },
  { Date: "2026-02-14", Description: "Spotify Premium Family Plan", Debit: "2800.00", Credit: "", Balance: "613350.00" },
  { Date: "2026-02-15", Description: "Sainsbury's Local Supermarket", Debit: "34100.00", Credit: "", Balance: "579250.00" },
  { Date: "2026-02-18", Description: "Amazon Online Purchase Electronics", Debit: "68500.00", Credit: "", Balance: "510750.00" },
  { Date: "2026-02-20", Description: "Electricity Utility Bill Payment", Debit: "22000.00", Credit: "", Balance: "488750.00" },
  { Date: "2026-02-22", Description: "Gym Membership Monthly", Debit: "15000.00", Credit: "", Balance: "473750.00" },
  { Date: "2026-02-25", Description: "Dividend Yield Payment", Debit: "", Credit: "45000.00", Balance: "518750.00" },
  { Date: "2026-02-27", Description: "TechCorp Monthly Payroll Salary", Debit: "", Credit: "750000.00", Balance: "1268750.00" },
  { Date: "2026-02-28", Description: "Restaurant Dinner Outing", Debit: "38400.00", Credit: "", Balance: "1230350.00" },
  { Date: "2026-03-02", Description: "Tesco Supermarket Groceries", Debit: "42000.00", Credit: "", Balance: "1188350.00" },
  { Date: "2026-03-05", Description: "Uber Trip Ride", Debit: "9800.00", Credit: "", Balance: "1178550.00" },
  { Date: "2026-03-10", Description: "Transfer to Investment Portfolio", Debit: "200000.00", Credit: "", Balance: "978550.00" },
];

export function getSampleDataset(): Dataset {
  return {
    id: "sample_stmt_001",
    name: "Sample Bank Statement",
    fileName: "Sample_Bank_Statement_2026.csv",
    columns: [
      { name: "Date", type: "date", nullable: false },
      { name: "Description", type: "string", nullable: false },
      { name: "Debit", type: "number", nullable: true },
      { name: "Credit", type: "number", nullable: true },
      { name: "Balance", type: "number", nullable: false },
    ],
    rows: SAMPLE_BANK_STATEMENT_ROWS,
    rowCount: SAMPLE_BANK_STATEMENT_ROWS.length,
    summary: [],
    uploadedAt: new Date().toISOString(),
  };
}
