"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  Zap,
  Upload,
  Search,
  Award,
  Calendar,
  Building2,
  BarChart3,
  Activity,
  Download,
  Printer,
  ArrowRightLeft,
  RotateCcw,
  FileCheck,
  LayoutDashboard,
  PieChart as PieIcon,
  Receipt,
  Cpu,
  LineChart as LineIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
} from "recharts";
import { useDataStore } from "@/stores/data-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { processBankStatement } from "@/lib/analytics/engine";
import { calculateFinancialHealthScore } from "@/lib/insights/health-score";
import { generateSmartInsights } from "@/lib/insights/insights";
import { formatCurrency } from "@/lib/analytics/currency-detector";
import { CATEGORY_COLORS, type TransactionCategory } from "@/lib/analytics/category-engine";
import { classifyTextML } from "@/lib/ml/text-classifier";
import { classifyTransactionML } from "@/lib/ml/transaction-classifier";

const ALL_CATEGORIES: TransactionCategory[] = [
  "Salary",
  "Transfer",
  "Groceries",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Restaurants",
  "Bills",
  "ATM",
  "POS",
  "Cash Withdrawal",
  "Investment",
  "Loan",
  "Insurance",
  "Subscription",
  "Education",
  "Travel",
  "Other",
];

const MONOCHROME_DONUT_COLORS = [
  "#ffffff",
  "#e5e5e5",
  "#d4d4d4",
  "#a3a3a3",
  "#737373",
  "#525252",
  "#404040",
  "#262626",
];

export function FintechDashboard() {
  const dataset = useDataStore((s) => s.dataset);
  const clearDataset = useDataStore((s) => s.clearDataset);
  const resetDashboard = useDashboardStore((s) => s.reset);

  const excludeTransfers = useDashboardStore((s) => s.excludeTransfers);
  const toggleExcludeTransfers = useDashboardStore((s) => s.toggleExcludeTransfers);
  const categoryOverrides = useDashboardStore((s) => s.categoryOverrides);
  const setCategoryOverride = useDashboardStore((s) => s.setCategoryOverride);
  const clearCategoryOverrides = useDashboardStore((s) => s.clearCategoryOverrides);

  const [activeTab, setActiveTab] = useState<"overview" | "ml" | "cashflow" | "income" | "categories" | "transactions">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const overrideCount = Object.keys(categoryOverrides).length;

  const options = useMemo(
    () => ({
      excludeTransfers,
      categoryOverrides,
    }),
    [excludeTransfers, categoryOverrides]
  );

  // 100% Client-Side Machine Learning Analytics Engine
  const analytics = useMemo(() => {
    return processBankStatement(dataset?.rows ?? [], dataset?.fileName ?? "", options);
  }, [dataset, options]);

  const healthScore = useMemo(() => {
    return calculateFinancialHealthScore(analytics);
  }, [analytics]);

  const insights = useMemo(() => {
    return generateSmartInsights(analytics);
  }, [analytics]);

  const filteredTransactions = useMemo(() => {
    return analytics.enrichedTransactions.filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.rawDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === "all" || tx.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [analytics.enrichedTransactions, searchTerm, selectedCategory]);

  if (!dataset) return null;

  const fmt = (amt: number, compact = false) => formatCurrency(amt, analytics.currency, { compact });

  const exportCSV = () => {
    const headers = ["ID", "Date", "Payee", "Raw Description", "Category", "Type", "Amount", "Balance", "Duplicate", "Spike"];
    const csvRows = analytics.enrichedTransactions.map((tx) => [
      tx.id,
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${tx.rawDescription.replace(/"/g, '""')}"`,
      tx.category,
      tx.type,
      tx.amount,
      tx.balance ?? "",
      tx.isDuplicate ? "Yes" : "No",
      tx.isAnomaly ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bank_Statement_${analytics.currency.code}_${dataset.fileName.replace(/\.[^/.]+$/, "")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden text-xs">
      {/* ═══ MONOCHROME COMPACT SIDEBAR ═══ */}
      <aside className="w-52 border-r border-neutral-800 bg-[#0a0a0a] p-3 flex flex-col justify-between hidden md:flex print:hidden">
        <div className="space-y-4">
          {/* Brand */}
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="h-6 w-6 rounded bg-white flex items-center justify-center text-black">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-bold text-xs text-white tracking-tight block leading-none">Vanguard</span>
              <span className="text-[8px] text-neutral-400 font-mono tracking-wider">CLIENT-SIDE ML ENGINE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5">
            {[
              { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
              { id: "ml", label: "Client ML Models", icon: Cpu },
              { id: "cashflow", label: "Cash Flow & Balance", icon: BarChart3 },
              { id: "income", label: "Income Analysis", icon: Building2 },
              { id: "categories", label: "Spending Breakdown", icon: PieIcon },
              { id: "transactions", label: `Ledger (${analytics.totalTransactions})`, icon: Receipt },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-neutral-800 text-white font-semibold border-l-2 border-white"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Health Rating Summary */}
        <div className="rounded border border-neutral-800 bg-[#121212] p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400 font-medium">Health Rating</span>
            <span className="font-bold text-[9px] px-1.5 py-0.5 rounded border border-neutral-700 bg-neutral-800 text-white">
              Grade {healthScore.grade}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white">{healthScore.score}<span className="text-[10px] text-neutral-400 font-normal">/100</span></div>
          <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${healthScore.score}%` }} />
          </div>
          <p className="text-[9px] text-neutral-400">{healthScore.riskLevel} &middot; {healthScore.confidenceScore}% confidence</p>
        </div>
      </aside>

      {/* ═══ MAIN WORKSPACE ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ═══ HEADER BAR ═══ */}
        <header className="sticky top-0 z-40 fintech-header px-4 py-2.5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between print:hidden text-xs">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm font-bold tracking-tight text-white">
                  {analytics.salaryInfo.employer !== "Primary Employer" ? `${analytics.salaryInfo.employer} Statement` : `${dataset.name}`}
                </h1>
                <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-300 border border-neutral-800 flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-white" />
                  Client ML Active
                </span>
                <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-white border border-neutral-800">
                  {analytics.currency.code} ({analytics.currency.symbol})
                </span>
                {excludeTransfers && (
                  <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-300 border border-neutral-800 flex items-center gap-1">
                    <ArrowRightLeft className="h-3 w-3" />
                    Operating Mode
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5 font-mono">
                <Calendar className="h-3 w-3 text-neutral-500" />
                {analytics.statementPeriod.start && analytics.statementPeriod.end
                  ? `${analytics.statementPeriod.start} → ${analytics.statementPeriod.end}`
                  : `${analytics.daysSpan} days`}
                {" "}· {analytics.totalTransactions} txns ({analytics.totalCredits} cr, {analytics.totalDebits} dr)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Operating Mode Toggle */}
            <button
              onClick={toggleExcludeTransfers}
              className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-[11px] font-medium transition-all ${
                excludeTransfers
                  ? "bg-white text-black border-white"
                  : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              <ArrowRightLeft className="h-3 w-3" />
              {excludeTransfers ? "Operating Mode" : "Gross Cash Flow"}
            </button>

            {/* Clear Overrides Button */}
            {overrideCount > 0 && (
              <button
                onClick={clearCategoryOverrides}
                className="inline-flex items-center gap-1 rounded border bg-neutral-900 border-neutral-800 text-neutral-300 px-2 py-1 text-[11px] font-medium hover:bg-neutral-800 transition-all"
              >
                <RotateCcw className="h-3 w-3" />
                Reset ({overrideCount})
              </button>
            )}

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 transition-all"
            >
              <Download className="h-3 w-3" />
              Export CSV
            </button>

            {/* Export Print/PDF */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 transition-all"
            >
              <Printer className="h-3 w-3" />
              Print / PDF
            </button>

            {/* Upload New Statement */}
            <button
              onClick={() => { clearDataset(); resetDashboard(); }}
              className="inline-flex items-center gap-1 rounded bg-white text-black px-3 py-1 text-[11px] font-semibold hover:bg-neutral-200 transition-all"
            >
              <Upload className="h-3 w-3" />
              Upload New
            </button>
          </div>
        </header>

        {/* Mobile Tab Strip */}
        <div className="md:hidden border-b border-neutral-800 bg-black p-1.5 flex gap-1 overflow-x-auto">
          {(["overview", "ml", "cashflow", "income", "categories", "transactions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded px-2.5 py-1 text-[11px] font-semibold capitalize whitespace-nowrap ${
                activeTab === tab ? "bg-white text-black" : "text-neutral-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ═══ DASHBOARD CONTENT ═══ */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* ═══ PRE-ANALYSIS DATA AUDIT BANNER ═══ */}
          <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Cpu className="h-4 w-4 text-white flex-shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Client-Side Machine Learning Active</span>
                  <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[9px] font-bold text-white border border-neutral-700 font-mono">
                    TF-IDF + Linear Regression + Multivariate Anomaly
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                  100% in-browser client ML &middot; {analytics.mlForecast.confidenceRating}% forecast fit confidence ($R^2 = {analytics.mlForecast.rSquared}$)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-400 border-t md:border-t-0 border-neutral-800 pt-1.5 md:pt-0">
              <div>
                <span className="text-white font-bold block">30-Day ML Projection</span>
                <span className="text-[9px] text-neutral-500">{fmt(analytics.mlForecast.projectedBalance30Days)}</span>
              </div>
              <div>
                <span className="text-white font-bold block">{analytics.mlForecast.trendDirection.toUpperCase()}</span>
                <span className="text-[9px] text-neutral-500">Trend Direction</span>
              </div>
            </div>
          </div>

          {/* ═══ TAB 1: EXECUTIVE OVERVIEW ═══ */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* High-Density KPI Cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Account Balance */}
                <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 block">Account Balance</span>
                  <div className="text-xl font-bold font-mono text-white tracking-tight mt-0.5">{fmt(analytics.currentBalance)}</div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-800 pt-1.5 font-mono">
                    <span>Open: {fmt(analytics.openingBalance)}</span>
                    <span className="font-semibold text-white">Close: {fmt(analytics.closingBalance)}</span>
                  </div>
                </div>

                {/* Total Income */}
                <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 block">
                    {excludeTransfers ? "Operating Income" : "Total Income"}
                  </span>
                  <div className="text-xl font-bold font-mono text-white tracking-tight mt-0.5">+{fmt(analytics.totalIncome)}</div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-800 pt-1.5 font-mono">
                    <span>Avg/Day: {fmt(analytics.avgDailyIncome, true)}</span>
                    <span>{analytics.totalCredits} credits</span>
                  </div>
                </div>

                {/* Total Expenses */}
                <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 block">
                    {excludeTransfers ? "Operating Expenses" : "Total Expenses"}
                  </span>
                  <div className="text-xl font-bold font-mono text-neutral-300 tracking-tight mt-0.5">-{fmt(analytics.totalExpenses)}</div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-800 pt-1.5 font-mono">
                    <span>Avg/Day: {fmt(analytics.avgDailySpending, true)}</span>
                    <span>{analytics.totalDebits} debits</span>
                  </div>
                </div>

                {/* Net Cash Flow */}
                <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 block">
                    {excludeTransfers ? "Net Operating Cash" : "Net Cash Flow"}
                  </span>
                  <div className="text-xl font-bold font-mono tracking-tight mt-0.5 text-white">
                    {analytics.netCashFlow >= 0 ? "+" : ""}{fmt(analytics.netCashFlow)}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-800 pt-1.5 font-mono">
                    <span>Savings: {analytics.totalIncome > 0 ? ((analytics.netCashFlow / analytics.totalIncome) * 100).toFixed(1) : "0"}%</span>
                    <span className="font-semibold text-white">
                      {analytics.cashFlowTrend === "improving" ? "↑ Improving" : analytics.cashFlowTrend === "declining" ? "↓ Declining" : "→ Stable"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Score + Running Balance Trajectory Chart */}
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Health Score Panel */}
                <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-white" />
                        Financial Health Score
                      </h3>
                      <span className="rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 text-[10px] font-bold font-mono text-white">
                        Grade {healthScore.grade}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-col items-center">
                      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-white">
                        <div className="text-center">
                          <span className="text-2xl font-bold font-mono text-white">{healthScore.score}</span>
                          <span className="text-[10px] text-neutral-400 block">/ 100</span>
                        </div>
                      </div>
                      <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-white">{healthScore.tier} Status ({healthScore.confidenceScore}% Confidence)</span>
                      <p className="mt-0.5 text-[10px] text-center text-neutral-400 leading-relaxed px-1">{healthScore.summary}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5 border-t border-neutral-800 pt-2.5">
                    {healthScore.factors.map((factor) => (
                      <div key={factor.name} className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-neutral-400 font-medium">{factor.name}</span>
                          <span className="font-bold font-mono text-white">{factor.score} / {factor.maxScore}</span>
                        </div>
                        <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(factor.score / factor.maxScore) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Running Balance Area Chart */}
                <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-4 lg:col-span-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div>
                      <h3 className="font-bold text-xs text-white">Running Balance Trajectory</h3>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {analytics.statementPeriod.start} → {analytics.statementPeriod.end} ({analytics.currency.symbol})
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="text-white">{analytics.positiveDaysCount} surplus days</span>
                      <span className="text-neutral-400">{analytics.negativeDaysCount} deficit days</span>
                    </div>
                  </div>
                  <div className="mt-3 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="date" className="text-[10px] text-neutral-400 font-mono" tickLine={false} />
                        <YAxis className="text-[10px] text-neutral-400 font-mono" tickLine={false} tickFormatter={(v) => `${analytics.currency.symbol}${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: "#000000", borderColor: "#262626", borderRadius: "0.25rem", color: "#ffffff", fontSize: "11px" }} formatter={(value) => [fmt(Number(value)), "Balance"]} />
                        <Area type="monotone" dataKey="runningBalance" stroke="#ffffff" strokeWidth={1.5} fillOpacity={1} fill="url(#balanceGrad)" name="Running Balance" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB 2: CLIENT-SIDE ML MODELS ═══ */}
          {activeTab === "ml" && (
            <div className="space-y-4">
              {/* 30-Day ML Balance Forecast Chart */}
              <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                  <div>
                    <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-white" />
                      30-Day Client ML Balance Forecast (Linear Regression)
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      Calculated 100% in-browser &middot; Fit Confidence $R^2 = {analytics.mlForecast.rSquared}$ &middot; Slope: {fmt(analytics.mlForecast.dailySlope)}/day
                    </p>
                  </div>
                  <span className="rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] font-bold font-mono text-white">
                    T+30 Forecast: {fmt(analytics.mlForecast.projectedBalance30Days)}
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.mlForecast.forecastPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mlForecastGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="date" className="text-[10px] text-neutral-400 font-mono" tickLine={false} />
                      <YAxis className="text-[10px] text-neutral-400 font-mono" tickLine={false} tickFormatter={(v) => `${analytics.currency.symbol}${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: "#000000", borderColor: "#262626", borderRadius: "0.25rem", color: "#ffffff", fontSize: "11px" }} formatter={(val) => fmt(Number(val))} />
                      <Area type="monotone" dataKey="projectedBalance" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#mlForecastGrad)" name="ML Projected Balance" />
                      <Area type="monotone" dataKey="upperBound" stroke="#737373" strokeDasharray="3 3" fill="none" name="+95% Upper Bound" />
                      <Area type="monotone" dataKey="lowerBound" stroke="#525252" strokeDasharray="3 3" fill="none" name="-95% Lower Bound" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Client-Side TF-IDF Payee Classification & Anomaly Detection Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* TF-IDF Payee Classification Table */}
                <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-4">
                  <h3 className="font-bold text-xs text-white border-b border-neutral-800 pb-2 mb-3">
                    TF-IDF + Cosine Similarity Payee Classification
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {analytics.enrichedTransactions.slice(0, 10).map((tx) => {
                      const pred = classifyTextML(tx.rawDescription);
                      return (
                        <div key={tx.id} className="rounded border border-neutral-800 bg-black p-2 flex items-center justify-between text-[10px] font-mono">
                          <div>
                            <span className="text-white font-bold block truncate max-w-[180px]">{tx.description}</span>
                            <span className="text-neutral-500">{pred.method} &middot; tokens: [{pred.topFeatures.join(", ")}]</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-bold block">{pred.category}</span>
                            <span className="text-neutral-400">{pred.confidenceScore}% ML confidence</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Multivariate Anomaly Detection Scores */}
                <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-4">
                  <h3 className="font-bold text-xs text-white border-b border-neutral-800 pb-2 mb-3">
                    Multivariate ML Anomaly Scores
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {analytics.mlAnomalyScores.slice(0, 10).map((mlScore) => {
                      const tx = analytics.enrichedTransactions.find((t) => t.id === mlScore.transactionId);
                      if (!tx) return null;
                      return (
                        <div key={mlScore.transactionId} className="rounded border border-neutral-800 bg-black p-2 flex items-center justify-between text-[10px] font-mono">
                          <div>
                            <span className="text-white font-bold block truncate max-w-[180px]">{tx.description}</span>
                            <span className="text-neutral-500">{mlScore.features.join(" &middot; ")}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-bold block">{fmt(tx.amount)}</span>
                            <span className="text-neutral-400">{mlScore.anomalyScore}% ML Anomaly Risk</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB 3: CASH FLOW ═══ */}
          {activeTab === "cashflow" && (
            <div className="space-y-4">
              <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-4">
                <h3 className="font-bold text-xs text-white border-b border-neutral-800 pb-2">Daily Income vs Expenses ({analytics.currency.symbol})</h3>
                <div className="mt-3 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="date" className="text-[10px] text-neutral-400 font-mono" tickLine={false} />
                      <YAxis className="text-[10px] text-neutral-400 font-mono" tickLine={false} tickFormatter={(v) => `${analytics.currency.symbol}${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: "#000000", borderColor: "#262626", borderRadius: "0.25rem", color: "#ffffff", fontSize: "11px" }} formatter={(val) => fmt(Number(val))} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#ffffff" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#525252" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {analytics.monthlyBreakdown.length > 0 && (
                <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-4">
                  <h3 className="font-bold text-xs text-white border-b border-neutral-800 pb-2">Monthly Cash Flow Summary</h3>
                  <div className="mt-3 h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.monthlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="month" className="text-[10px] text-neutral-400 font-mono" tickLine={false} />
                        <YAxis className="text-[10px] text-neutral-400 font-mono" tickLine={false} tickFormatter={(v) => `${analytics.currency.symbol}${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: "#000000", borderColor: "#262626", borderRadius: "0.25rem", color: "#ffffff", fontSize: "11px" }} formatter={(val) => fmt(Number(val))} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#ffffff" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="#525252" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="net" name="Net" fill="#a3a3a3" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ═══ YEARLY CASH FLOW SUMMARY ═══ */}
              {analytics.yearlyBreakdown.length > 0 && (
                <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <h3 className="font-bold text-xs text-white">Yearly Cash Flow Breakdown ({analytics.currency.symbol})</h3>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {analytics.yearlyBreakdown.length} year(s) analyzed
                    </span>
                  </div>
                  <div className="mt-3 h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.yearlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="year" className="text-[10px] text-neutral-400 font-mono" tickLine={false} />
                        <YAxis className="text-[10px] text-neutral-400 font-mono" tickLine={false} tickFormatter={(v) => `${analytics.currency.symbol}${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: "#000000", borderColor: "#262626", borderRadius: "0.25rem", color: "#ffffff", fontSize: "11px" }} formatter={(val) => fmt(Number(val))} />
                        <Legend />
                        <Bar dataKey="income" name="Yearly Income" fill="#ffffff" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="expenses" name="Yearly Expenses" fill="#525252" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="net" name="Net Cash Flow" fill="#a3a3a3" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-black text-neutral-400 font-semibold border-b border-neutral-800">
                        <tr>
                          <th className="px-3 py-2">Year</th>
                          <th className="px-3 py-2 text-right">Income</th>
                          <th className="px-3 py-2 text-right">Expenses</th>
                          <th className="px-3 py-2 text-right">Net Cash Flow</th>
                          <th className="px-3 py-2 text-right">Txns</th>
                          <th className="px-3 py-2 text-right">Savings Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {analytics.yearlyBreakdown.map((y) => (
                          <tr key={y.year} className="hover:bg-neutral-900 transition-colors">
                            <td className="px-3 py-2 font-bold text-white">{y.year}</td>
                            <td className="px-3 py-2 text-right text-white font-bold">+{fmt(y.income)}</td>
                            <td className="px-3 py-2 text-right text-neutral-300">-{fmt(y.expenses)}</td>
                            <td className="px-3 py-2 text-right text-white font-bold">{y.net >= 0 ? "+" : ""}{fmt(y.net)}</td>
                            <td className="px-3 py-2 text-right text-neutral-400">{y.transactionCount}</td>
                            <td className="px-3 py-2 text-right text-white font-bold">{y.savingsRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ TAB 4: INCOME ANALYSIS ═══ */}
          {activeTab === "income" && (
            <div className="space-y-4">
              <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-white" />
                    Salary & Payroll Detection
                  </h3>
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-bold border border-neutral-700 bg-neutral-800 text-white">
                    {analytics.salaryInfo.detected ? "Salary Verified" : "No Regular Salary Pattern"}
                  </span>
                </div>
                {analytics.salaryInfo.detected && (
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-4 font-mono text-[11px]">
                    <div className="bg-black border border-neutral-800 rounded p-2.5">
                      <span className="text-neutral-400 uppercase text-[9px] block">Employer</span>
                      <span className="font-bold text-white text-xs mt-0.5 block">{analytics.salaryInfo.employer}</span>
                    </div>
                    <div className="bg-black border border-neutral-800 rounded p-2.5">
                      <span className="text-neutral-400 uppercase text-[9px] block">Avg Paycheck</span>
                      <span className="font-bold text-white text-xs mt-0.5 block">{fmt(analytics.salaryInfo.avgAmount)}</span>
                    </div>
                    <div className="bg-black border border-neutral-800 rounded p-2.5">
                      <span className="text-neutral-400 uppercase text-[9px] block">Frequency</span>
                      <span className="font-bold text-white text-xs mt-0.5 block">{analytics.salaryInfo.frequency}</span>
                    </div>
                    <div className="bg-black border border-neutral-800 rounded p-2.5">
                      <span className="text-neutral-400 uppercase text-[9px] block">Total Salary</span>
                      <span className="font-bold text-white text-xs mt-0.5 block">{fmt(analytics.salaryInfo.totalSalary)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ TAB 5: CATEGORIES ═══ */}
          {activeTab === "categories" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analytics.categoryBreakdown.map((cat, idx) => (
                <div key={cat.category} className="rounded border border-neutral-800 bg-[#0a0a0a] p-3 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                    <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MONOCHROME_DONUT_COLORS[idx % MONOCHROME_DONUT_COLORS.length] }} />
                      {cat.category}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-400">{cat.percentage}%</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-base font-bold text-white">{fmt(cat.total)}</span>
                    <span className="text-[10px] text-neutral-400">{cat.count} txns</span>
                  </div>
                  <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-white" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ TAB 6: TRANSACTION LEDGER ═══ */}
          {activeTab === "transactions" && (
            <div className="rounded border border-neutral-800 bg-[#0a0a0a] shadow-lg overflow-hidden">
              <div className="flex flex-col gap-2 border-b border-neutral-800 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-bold text-xs text-white">Enriched Transaction Ledger</h3>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {filteredTransactions.length} of {analytics.totalTransactions} shown · Click category badge to reclassify
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3 w-3 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search payee..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="rounded border border-neutral-800 bg-black pl-7 pr-2.5 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-white w-40 md:w-56"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded border border-neutral-800 bg-black px-2 py-1 text-[11px] font-medium text-white focus:outline-none focus:ring-1 focus:ring-white"
                  >
                    <option value="all">All Categories</option>
                    {analytics.categoryBreakdown.map((c) => (
                      <option key={c.category} value={c.category}>{c.category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-black text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Payee / Merchant</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filteredTransactions.slice(0, 100).map((tx) => (
                      <tr key={tx.id} className="hover:bg-neutral-900 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap text-neutral-400">{tx.date}</td>
                        <td className="px-3 py-2 font-sans font-medium">
                          <span className="font-bold text-white">{tx.description}</span>
                          {tx.rawDescription !== tx.description && (
                            <span className="text-[9px] text-neutral-500 block font-mono truncate max-w-xs">{tx.rawDescription}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={tx.category}
                            onChange={(e) => setCategoryOverride(tx.id, e.target.value as TransactionCategory)}
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold border border-neutral-700 bg-neutral-800 text-white cursor-pointer font-sans"
                          >
                            {ALL_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat} className="bg-black text-white font-sans">{cat}</option>
                            ))}
                          </select>
                        </td>
                        <td className={`px-3 py-2 text-right font-bold whitespace-nowrap ${tx.type === "credit" ? "text-white" : "text-neutral-300"}`}>
                          {tx.type === "credit" ? "+" : "-"}{fmt(tx.amount)}
                        </td>
                        <td className="px-3 py-2 text-right text-neutral-400 whitespace-nowrap">
                          {tx.balance != null ? fmt(tx.balance) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
