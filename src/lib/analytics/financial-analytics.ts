export interface FinancialCategoryShare {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface RecurringExpense {
  description: string;
  avgAmount: number;
  occurrences: number;
}

export interface FinancialAnalyticsResult {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  expenseRatio: number;
  avgTransactionSize: number;
  topExpenseCategories: FinancialCategoryShare[];
  topMerchants: FinancialCategoryShare[];
  recurringExpenses: RecurringExpense[];
}

export function analyzeFinancialData(
  rows: Record<string, unknown>[]
): FinancialAnalyticsResult {
  if (!rows || rows.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netCashFlow: 0,
      savingsRate: 0,
      expenseRatio: 0,
      avgTransactionSize: 0,
      topExpenseCategories: [],
      topMerchants: [],
      recurringExpenses: [],
    };
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  let transactionCount = 0;

  const categoryTotals = new Map<string, { total: number; count: number }>();
  const merchantTotals = new Map<string, { total: number; count: number }>();

  for (const row of rows) {
    const amount = Number(row.Amount ?? row.amount);
    const debit = Number(row.Debit ?? row.debit);
    const credit = Number(row.Credit ?? row.credit);
    const desc = String(row.Description ?? row.description ?? row.Category ?? row.category ?? "Other").trim();

    let inc = 0;
    let exp = 0;

    if (!isNaN(credit) && credit > 0) {
      inc = credit;
    }
    if (!isNaN(debit) && debit > 0) {
      exp = debit;
    }

    if (inc === 0 && exp === 0 && !isNaN(amount)) {
      if (amount > 0) inc = amount;
      else if (amount < 0) exp = Math.abs(amount);
    }

    totalIncome += inc;
    totalExpenses += exp;
    transactionCount++;

    if (exp > 0 && desc) {
      // Aggregate by merchant/description
      const existingDesc = merchantTotals.get(desc) || { total: 0, count: 0 };
      merchantTotals.set(desc, {
        total: existingDesc.total + exp,
        count: existingDesc.count + 1,
      });

      // Simple category heuristic
      const catKey = desc.length > 25 ? desc.substring(0, 25) + "..." : desc;
      const existingCat = categoryTotals.get(catKey) || { total: 0, count: 0 };
      categoryTotals.set(catKey, {
        total: existingCat.total + exp,
        count: existingCat.count + 1,
      });
    }
  }

  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const avgTransactionSize = transactionCount > 0 ? (totalExpenses + totalIncome) / transactionCount : 0;

  // Format Top Merchants
  const topMerchants: FinancialCategoryShare[] = Array.from(merchantTotals.entries())
    .map(([category, { total, count }]) => ({
      category,
      total: Number(total.toFixed(2)),
      percentage: totalExpenses > 0 ? Number(((total / totalExpenses) * 100).toFixed(1)) : 0,
      count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Format Top Categories
  const topExpenseCategories: FinancialCategoryShare[] = Array.from(categoryTotals.entries())
    .map(([category, { total, count }]) => ({
      category,
      total: Number(total.toFixed(2)),
      percentage: totalExpenses > 0 ? Number(((total / totalExpenses) * 100).toFixed(1)) : 0,
      count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Detect Recurring Expenses (appear >= 2 times with consistent names)
  const recurringExpenses: RecurringExpense[] = Array.from(merchantTotals.entries())
    .filter(([_, { count }]) => count >= 2)
    .map(([description, { total, count }]) => ({
      description,
      avgAmount: Number((total / count).toFixed(2)),
      occurrences: count,
    }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5);

  return {
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netCashFlow: Number(netCashFlow.toFixed(2)),
    savingsRate: Number(savingsRate.toFixed(1)),
    expenseRatio: Number(expenseRatio.toFixed(1)),
    avgTransactionSize: Number(avgTransactionSize.toFixed(2)),
    topExpenseCategories,
    topMerchants,
    recurringExpenses,
  };
}
