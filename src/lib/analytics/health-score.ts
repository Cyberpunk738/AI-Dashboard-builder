import type { BankStatementAnalytics } from "./engine";
import { formatCurrency } from "./currency-detector";

export interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "fair" | "poor";
  impact: string;
}

export interface FinancialHealthScore {
  score: number; // 0 - 100
  tier: "Excellent" | "Good" | "Fair" | "Needs Attention";
  grade: "A+" | "A" | "B" | "C" | "D";
  riskLevel: "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk";
  confidenceScore: number; // 0 - 100%
  color: string;
  summary: string;
  factors: HealthFactor[];
}

export function calculateFinancialHealthScore(
  analytics: BankStatementAnalytics
): FinancialHealthScore {
  const {
    currency,
    totalIncome,
    totalExpenses,
    netCashFlow,
    positiveDaysCount,
    negativeDaysCount,
    salaryInfo,
    categoryBreakdown,
    timeSeries,
    incomeConcentration,
    cashFlowTrend,
    validationReport,
    top3MerchantShare,
    balanceVolatility,
  } = analytics;

  const factors: HealthFactor[] = [];
  let totalScore = 0;

  // 1. Savings Rate & Cash Flow Positivity (Max 25 pts)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  let savingsScore = 0;
  if (savingsRate >= 25) savingsScore = 25;
  else if (savingsRate >= 15) savingsScore = 20;
  else if (savingsRate >= 5) savingsScore = 14;
  else if (savingsRate > 0) savingsScore = 8;
  else savingsScore = 0;

  totalScore += savingsScore;
  factors.push({
    name: "Savings Rate & Cash Surplus",
    score: savingsScore,
    maxScore: 25,
    status: savingsScore >= 20 ? "excellent" : savingsScore >= 14 ? "good" : savingsScore >= 8 ? "fair" : "poor",
    impact: `Savings rate is ${savingsRate.toFixed(1)}% (${formatCurrency(Math.abs(netCashFlow), currency)} retained out of ${formatCurrency(totalIncome, currency)} total income).`,
  });

  // 2. Balance Dynamics & Stability (Max 20 pts)
  let stabilityScore = 20;
  if (balanceVolatility > 100) stabilityScore = 8;
  else if (balanceVolatility > 60) stabilityScore = 14;

  if (cashFlowTrend === "improving" && stabilityScore < 20) stabilityScore = Math.min(20, stabilityScore + 3);

  totalScore += stabilityScore;
  factors.push({
    name: "Cash Reserves & Volatility",
    score: stabilityScore,
    maxScore: 20,
    status: stabilityScore >= 16 ? "excellent" : stabilityScore >= 12 ? "good" : "poor",
    impact: `Balance volatility is ${balanceVolatility.toFixed(0)}% (Coefficient of Variation) with ${positiveDaysCount} surplus days out of ${timeSeries.length || 1}.`,
  });

  // 3. Income Consistency & Diversification (Max 20 pts)
  let incomeScore = 0;
  if (salaryInfo.detected && salaryInfo.frequency === "Monthly") incomeScore = 20;
  else if (salaryInfo.detected) incomeScore = 16;
  else if (totalIncome > 0 && incomeConcentration < 80) incomeScore = 12;
  else if (totalIncome > 0) incomeScore = 10;
  else incomeScore = 3;

  totalScore += incomeScore;
  factors.push({
    name: "Income Consistency",
    score: incomeScore,
    maxScore: 20,
    status: incomeScore >= 18 ? "excellent" : incomeScore >= 12 ? "good" : incomeScore >= 8 ? "fair" : "poor",
    impact: salaryInfo.detected
      ? `${salaryInfo.frequency} salary detected (${formatCurrency(salaryInfo.avgAmount, currency)}) from ${salaryInfo.employer}.`
      : `${analytics.incomeStreams.length} income source(s) detected — top source represents ${incomeConcentration.toFixed(0)}% of income.`,
  });

  // 4. Overdraft & Negative Balance Checks (Max 15 pts)
  const overdraftDays = timeSeries.filter((pt) => pt.runningBalance < 0).length;
  let balanceScore = overdraftDays === 0 ? 15 : overdraftDays <= 2 ? 8 : 0;

  totalScore += balanceScore;
  factors.push({
    name: "Account Safety & Overdraft",
    score: balanceScore,
    maxScore: 15,
    status: balanceScore === 15 ? "excellent" : balanceScore >= 8 ? "fair" : "poor",
    impact: overdraftDays === 0
      ? "Maintained positive balance throughout the statement period."
      : `Negative balance detected on ${overdraftDays} day(s).`,
  });

  // 5. Merchant & Category Concentration (Max 10 pts)
  let concentrationScore = 10;
  if (top3MerchantShare > 60) concentrationScore = 4;
  else if (top3MerchantShare > 40) concentrationScore = 7;

  totalScore += concentrationScore;
  factors.push({
    name: "Spending Concentration",
    score: concentrationScore,
    maxScore: 10,
    status: concentrationScore >= 8 ? "excellent" : concentrationScore >= 6 ? "good" : "fair",
    impact: `Top 3 merchants represent ${top3MerchantShare.toFixed(1)}% of total expenses across ${categoryBreakdown.length} categories.`,
  });

  // 6. Data Integrity & Validation Quality (Max 10 pts)
  const dataQualityScore = validationReport?.dataQualityScore ?? 100;
  let qualityScore = Math.round((dataQualityScore / 100) * 10);

  totalScore += qualityScore;
  factors.push({
    name: "Data & Ledger Quality",
    score: qualityScore,
    maxScore: 10,
    status: qualityScore >= 9 ? "excellent" : qualityScore >= 7 ? "good" : "poor",
    impact: `Statement data quality rating is ${dataQualityScore}% (${validationReport?.validRowCount ?? 0} valid, ${validationReport?.flaggedRowCount ?? 0} flagged).`,
  });

  const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // Risk Level Determination
  let riskLevel: "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk" = "Low Risk";
  let tier: "Excellent" | "Good" | "Fair" | "Needs Attention" = "Good";
  let grade: "A+" | "A" | "B" | "C" | "D" = "B";
  let color = "#10b981";
  let summary = "Solid financial management with healthy cash flow dynamics.";

  if (finalScore >= 85) {
    tier = "Excellent";
    grade = "A+";
    riskLevel = "Low Risk";
    color = "#ffffff";
    summary = "Exceptional financial health with robust cash reserves, steady income, and well-balanced spending.";
  } else if (finalScore >= 70) {
    tier = "Good";
    grade = "A";
    riskLevel = "Low Risk";
    color = "#e5e5e5";
    summary = "Healthy financial position with positive net cash flow and manageable spending concentration.";
  } else if (finalScore >= 55) {
    tier = "Fair";
    grade = "B";
    riskLevel = "Moderate Risk";
    color = "#a3a3a3";
    summary = "Moderate financial health. Focus on building an emergency reserve and reducing peak spending spikes.";
  } else if (finalScore >= 40) {
    tier = "Needs Attention";
    grade = "C";
    riskLevel = "High Risk";
    color = "#737373";
    summary = "Cash flow pressure detected. High expense ratio and spending concentration require attention.";
  } else {
    tier = "Needs Attention";
    grade = "D";
    riskLevel = "Critical Risk";
    color = "#525252";
    summary = "Significant financial vulnerability. Expenses exceed income — immediate budget restructuring recommended.";
  }

  // Confidence Score is tied to data quality + sample size (number of transactions & days span)
  const daysConfidence = Math.min(50, (analytics.daysSpan / 30) * 50);
  const qualityConfidence = (dataQualityScore / 100) * 50;
  const confidenceScore = Math.min(100, Math.round(daysConfidence + qualityConfidence));

  return {
    score: finalScore,
    tier,
    grade,
    riskLevel,
    confidenceScore,
    color,
    summary,
    factors,
  };
}
