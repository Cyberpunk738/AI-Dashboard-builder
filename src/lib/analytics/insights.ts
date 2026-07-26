import type { BankStatementAnalytics } from "./engine";
import { formatCurrency } from "./currency-detector";

export interface SmartInsightCard {
  id: string;
  type: "positive" | "warning" | "info" | "tip";
  title: string;
  metric: string;
  description: string;
  category: "spending" | "income" | "savings" | "merchants" | "trends" | "anomalies" | "channels" | "quality";
}

export function generateSmartInsights(
  analytics: BankStatementAnalytics
): SmartInsightCard[] {
  const {
    currency,
    totalIncome,
    totalExpenses,
    netCashFlow,
    bestFinancialDay,
    worstFinancialDay,
    bestMonth,
    categoryBreakdown,
    topMerchants,
    top3MerchantShare,
    recurringSubscriptions,
    incomeStreams,
    weekdayVsWeekendSpending,
    monthOverMonthExpenseChange,
    cashFlowTrend,
    dayOfWeekBreakdown,
    monthlyBreakdown,
    expenseStats,
    medianTransaction,
    anomalies,
    salaryInfo,
    highestBalance,
    lowestBalance,
    avgDailyBalance,
    longestSpendingStreak,
    longestIncomeStreak,
    atmUsage,
    posUsage,
    cashWithdrawalUsage,
    validationReport,
    classification,
    largestDebit,
    incomeToExpenseRatio,
    timeSeries,
  } = analytics;

  const insights: SmartInsightCard[] = [];
  const fmt = (v: number) => formatCurrency(v, currency);

  // 1. Document Classification Insight
  insights.push({
    id: "ins_doc_type",
    type: "info",
    title: "Document Classification",
    metric: `${classification.confidenceScore}% confidence`,
    description: `Validated document format as "${classification.documentType}" with ${validationReport.validRowCount} verified row(s).`,
    category: "quality",
  });

  // 2. Data Validation & Quality Alert
  if (validationReport.flaggedRowCount > 0) {
    insights.push({
      id: "ins_data_quality",
      type: validationReport.dataQualityScore < 70 ? "warning" : "info",
      title: "Data Audit & Hygiene",
      metric: `Grade ${validationReport.qualityGrade}`,
      description: `${validationReport.flaggedRowCount} row(s) flagged (${validationReport.balanceMathDiscrepancies} balance math discrepancies, ${validationReport.duplicateRowCount} duplicate rows).`,
      category: "quality",
    });
  }

  // 3. Cash Flow Trend Direction
  if (cashFlowTrend === "improving") {
    insights.push({
      id: "ins_trend_up",
      type: "positive",
      title: "Cash Flow Trajectory",
      metric: "↑ Upward Trend",
      description: "Net cash flow improved in your most recent month compared to the prior period.",
      category: "trends",
    });
  } else if (cashFlowTrend === "declining") {
    insights.push({
      id: "ins_trend_down",
      type: "warning",
      title: "Cash Flow Trajectory",
      metric: "↓ Downward Trend",
      description: "Net cash flow decreased in your latest month compared to the prior period.",
      category: "trends",
    });
  }

  // 4. Month-over-Month Expense Change
  if (monthOverMonthExpenseChange !== null) {
    const dir = monthOverMonthExpenseChange > 0 ? "increased" : "decreased";
    insights.push({
      id: "ins_mom_exp",
      type: monthOverMonthExpenseChange > 10 ? "warning" : monthOverMonthExpenseChange < -5 ? "positive" : "info",
      title: "Month-over-Month Expenses",
      metric: `${monthOverMonthExpenseChange > 0 ? "+" : ""}${monthOverMonthExpenseChange.toFixed(1)}%`,
      description: `Your spending ${dir} by ${Math.abs(monthOverMonthExpenseChange).toFixed(1)}% compared to the previous month.`,
      category: "trends",
    });
  }

  // 5. Savings Rate & Income-to-Expense Ratio
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  if (savingsRate > 20) {
    insights.push({
      id: "ins_savings_strong",
      type: "positive",
      title: "Strong Savings Rate",
      metric: `${savingsRate.toFixed(1)}%`,
      description: `You saved ${fmt(netCashFlow)} — retaining over 20% of your income is a solid financial benchmark.`,
      category: "savings",
    });
  } else if (totalIncome > 0 && netCashFlow < 0) {
    insights.push({
      id: "ins_savings_deficit",
      type: "warning",
      title: "Operating Deficit",
      metric: `-${fmt(Math.abs(netCashFlow))}`,
      description: `Expenses exceeded income by ${fmt(Math.abs(netCashFlow))} (Income-to-Expense ratio: ${incomeToExpenseRatio.toFixed(2)}x).`,
      category: "savings",
    });
  }

  // 6. Balance Range & Low Balance Threshold Tracking
  const lowThreshold = avgDailyBalance * 0.2;
  const lowDaysCount = timeSeries.filter((pt) => pt.runningBalance <= lowThreshold && lowThreshold > 0).length;
  if (lowDaysCount > 0) {
    insights.push({
      id: "ins_low_bal",
      type: "warning",
      title: "Low Reserve Days",
      metric: `${lowDaysCount} days`,
      description: `Your account balance remained below ${fmt(lowThreshold)} for ${lowDaysCount} day(s) during this period.`,
      category: "trends",
    });
  }

  // 7. Salary Arrival Window Detection
  if (salaryInfo.detected && salaryInfo.paydates.length > 0) {
    const dayNumbers = salaryInfo.paydates.map((d) => new Date(d).getDate()).sort((a, b) => a - b);
    const minDay = dayNumbers[0];
    const maxDay = dayNumbers[dayNumbers.length - 1];
    insights.push({
      id: "ins_salary_window",
      type: "positive",
      title: "Salary Pattern",
      metric: `${fmt(salaryInfo.avgAmount)}/mo`,
      description: `Salary from ${salaryInfo.employer} consistently arrives between the ${minDay}${getDaySuffix(minDay)} and ${maxDay}${getDaySuffix(maxDay)} of the month.`,
      category: "income",
    });
  }

  // 8. Dominant Expense Category
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    insights.push({
      id: "ins_top_cat",
      type: top.percentage > 35 ? "warning" : "info",
      title: "Top Expense Category",
      metric: `${top.percentage.toFixed(1)}%`,
      description: `"${top.category}" accounts for ${fmt(top.total)} (${top.percentage.toFixed(1)}% of all expenses) across ${top.count} transactions.`,
      category: "spending",
    });
  }

  // 9. Merchant Concentration Risk (Top 3 Merchants)
  if (top3MerchantShare > 50) {
    insights.push({
      id: "ins_merchant_conc",
      type: "warning",
      title: "Merchant Concentration Risk",
      metric: `${top3MerchantShare.toFixed(1)}% share`,
      description: `Your top 3 merchants account for ${top3MerchantShare.toFixed(1)}% of total spending. Diversifying payees reduces concentration risk.`,
      category: "merchants",
    });
  }

  // 10. Weekend vs. Weekday Ratio
  if (weekdayVsWeekendSpending.weekendPct > 30) {
    insights.push({
      id: "ins_weekend_spending",
      type: "tip",
      title: "Weekend Spending Share",
      metric: `${weekdayVsWeekendSpending.weekendPct.toFixed(1)}% weekends`,
      description: `Weekend spending is ${weekdayVsWeekendSpending.weekendPct.toFixed(1)}% of total expenses (${fmt(weekdayVsWeekendSpending.weekend)} total).`,
      category: "spending",
    });
  }

  // 11. Busiest Day of Week Spike
  const busiestDay = dayOfWeekBreakdown.reduce((a, b) => b.totalSpent > a.totalSpent ? b : a, dayOfWeekBreakdown[0]);
  if (busiestDay && busiestDay.totalSpent > 0) {
    insights.push({
      id: "ins_busiest_day",
      type: "tip",
      title: "Peak Spending Day",
      metric: busiestDay.day,
      description: `Spending spikes occur on ${busiestDay.day}s, totaling ${fmt(busiestDay.totalSpent)} across ${busiestDay.transactionCount} transactions (avg ${fmt(busiestDay.avgSpent)}/day).`,
      category: "spending",
    });
  }

  // 12. Single Largest Debit Dominance
  if (largestDebit && totalExpenses > 0) {
    const singlePct = (largestDebit.amount / totalExpenses) * 100;
    if (singlePct >= 15) {
      insights.push({
        id: "ins_single_debit",
        type: "warning",
        title: "Single Transaction Dominance",
        metric: `${singlePct.toFixed(1)}% of expenses`,
        description: `Your largest single transaction (${largestDebit.description} for ${fmt(largestDebit.amount)}) represents ${singlePct.toFixed(1)}% of all spending.`,
        category: "spending",
      });
    }
  }

  // 13. Channel Usage Insights (ATM / POS / Cash)
  if (posUsage.percentageOfExpenses > 20) {
    insights.push({
      id: "ins_pos_channel",
      type: "info",
      title: "POS Terminal Volume",
      metric: `${posUsage.percentageOfExpenses.toFixed(1)}% POS`,
      description: `Card POS terminals account for ${fmt(posUsage.total)} across ${posUsage.count} transactions.`,
      category: "channels",
    });
  }
  if (atmUsage.count >= 3 || cashWithdrawalUsage.count >= 3) {
    const cashTotal = atmUsage.total + cashWithdrawalUsage.total;
    insights.push({
      id: "ins_cash_channel",
      type: "tip",
      title: "Cash Withdrawal Frequency",
      metric: `${atmUsage.count + cashWithdrawalUsage.count} withdrawals`,
      description: `Recorded ${atmUsage.count + cashWithdrawalUsage.count} cash/ATM withdrawals totaling ${fmt(cashTotal)}.`,
      category: "channels",
    });
  }

  // 14. Streaks (Longest spending & income streaks)
  if (longestSpendingStreak >= 5) {
    insights.push({
      id: "ins_spend_streak",
      type: "info",
      title: "Consecutive Spend Streak",
      metric: `${longestSpendingStreak} days`,
      description: `You had a continuous ${longestSpendingStreak}-day streak of consecutive daily expenses.`,
      category: "spending",
    });
  }

  // 15. Recurring Subscriptions
  if (recurringSubscriptions.length > 0) {
    const totalSub = recurringSubscriptions.reduce((a, b) => a + b.amount, 0);
    insights.push({
      id: "ins_subs",
      type: recurringSubscriptions.length > 5 ? "warning" : "info",
      title: "Recurring Subscriptions",
      metric: `${recurringSubscriptions.length} vendor(s)`,
      description: `Estimated ${fmt(totalSub)}/month spent across ${recurringSubscriptions.length} recurring vendors.`,
      category: "spending",
    });
  }

  // 16. Spending Skew (Mean vs. Median)
  if (expenseStats.count >= 5 && expenseStats.mean > 0 && medianTransaction > 0) {
    const skewRatio = expenseStats.mean / medianTransaction;
    if (skewRatio > 2) {
      insights.push({
        id: "ins_skew",
        type: "tip",
        title: "Spending Skew Ratio",
        metric: `${skewRatio.toFixed(1)}x skew`,
        description: `Average debit (${fmt(expenseStats.mean)}) is ${skewRatio.toFixed(1)}x higher than median (${fmt(medianTransaction)}), indicating high-value outlier transactions.`,
        category: "spending",
      });
    }
  }

  return insights;
}

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}
