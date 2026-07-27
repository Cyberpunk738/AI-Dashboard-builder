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
  Star,
  Home as HomeIcon,
  ArrowLeft,
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

interface FintechDashboardProps {
  onReturnHome?: () => void;
}

export function FintechDashboard({ onReturnHome }: FintechDashboardProps) {
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

  const handleGoHome = () => {
    clearDataset();
    resetDashboard();
    onReturnHome?.();
  };

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
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white overflow-hidden text-xs">
      {/* ═══ STELLAR.AI COMPACT SIDEBAR ═══ */}
      <aside className="w-56 border-r border-gray-200 bg-white p-4 flex flex-col justify-between hidden md:flex print:hidden">
        <div className="space-y-5">
          {/* Brand & Home Link */}
          <div
            className="flex items-center justify-between px-1 py-1 cursor-pointer group"
            onClick={handleGoHome}
            title="Return to Home"
          >
            <div className="flex items-center gap-2.5">
              <Star className="h-5 w-5 fill-black text-black group-hover:scale-105 transition-transform" />
              <div>
                <span className="font-semibold text-sm text-black tracking-tight block leading-none">Vanguard AI</span>
                <span className="text-[9px] text-gray-500 font-mono tracking-wider">STELLAR ENGINE</span>
              </div>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={handleGoHome}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold text-gray-700 hover:bg-gray-100 hover:text-black transition-all mb-2 border border-gray-200/80 bg-gray-50/50"
            >
              <HomeIcon className="h-3.5 w-3.5" />
              <span>← Return to Home</span>
            </button>

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
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-black text-white font-semibold shadow-xs"
                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Health Rating Summary */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-600 font-medium">Health Rating</span>
            <span className="font-bold text-[9px] px-2 py-0.5 rounded-full border border-gray-200 bg-white text-black shadow-2xs">
              Grade {healthScore.grade}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-black">{healthScore.score}<span className="text-[10px] text-gray-400 font-normal">/100</span></div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-black rounded-full transition-all" style={{ width: `${healthScore.score}%` }} />
          </div>
          <p className="text-[9px] text-gray-500">{healthScore.riskLevel} &middot; {healthScore.confidenceScore}% confidence</p>
        </div>
      </aside>

      {/* ═══ MAIN WORKSPACE ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
        {/* ═══ HEADER BAR ═══ */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between print:hidden text-xs">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleGoHome}
                  className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-900 border border-gray-200 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <HomeIcon className="h-3 w-3" />
                  <span>Home</span>
                </button>
                <h1 className="text-sm font-bold tracking-tight text-gray-900">
                  {analytics.salaryInfo.employer !== "Primary Employer" ? `${analytics.salaryInfo.employer} Statement` : `${dataset.name}`}
                </h1>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-800 border border-gray-200 flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-black" />
                  Client ML Active
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-black border border-gray-200">
                  {analytics.currency.code} ({analytics.currency.symbol})
                </span>
                {excludeTransfers && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-800 border border-gray-200 flex items-center gap-1">
                    <ArrowRightLeft className="h-3 w-3" />
                    Operating Mode
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 font-sans">
                <Calendar className="h-3 w-3 text-gray-400" />
                {analytics.statementPeriod.start && analytics.statementPeriod.end
                  ? `${analytics.statementPeriod.start} → ${analytics.statementPeriod.end}`
                  : `${analytics.daysSpan} days`}
                {" "}· {analytics.totalTransactions} txns ({analytics.totalCredits} cr, {analytics.totalDebits} dr)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Operating Mode Toggle */}
            <button
              onClick={toggleExcludeTransfers}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${
                excludeTransfers
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ArrowRightLeft className="h-3 w-3" />
              {excludeTransfers ? "Operating Mode" : "Gross Cash Flow"}
            </button>

            {/* Clear Overrides Button */}
            {overrideCount > 0 && (
              <button
                onClick={clearCategoryOverrides}
                className="inline-flex items-center gap-1.5 rounded-full border bg-white border-gray-200 text-gray-700 px-3 py-1.5 text-[11px] font-medium hover:bg-gray-100 transition-all"
              >
                <RotateCcw className="h-3 w-3" />
                Reset ({overrideCount})
              </button>
            )}

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 transition-all"
            >
              <Download className="h-3 w-3" />
              Export CSV
            </button>

            {/* Export Print/PDF */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100 transition-all"
            >
              <Printer className="h-3 w-3" />
              Print / PDF
            </button>

            {/* Return to Home / Upload New Statement */}
            <button
              onClick={handleGoHome}
              className="inline-flex items-center gap-1.5 rounded-full bg-black text-white px-4 py-1.5 text-[11px] font-semibold hover:bg-gray-800 transition-all shadow-xs"
            >
              <HomeIcon className="h-3 w-3" />
              Return Home
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
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ═══ PRE-ANALYSIS DATA AUDIT BANNER ═══ */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Client-Side Machine Learning Active</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[9px] font-semibold text-gray-800 border border-gray-200">
                    TF-IDF + Linear Regression + Multivariate Anomaly
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5 font-sans">
                  100% in-browser client ML &middot; {analytics.mlForecast.confidenceRating}% forecast fit confidence ($R^2 = {analytics.mlForecast.rSquared}$)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-sans text-gray-600 border-t md:border-t-0 border-gray-100 pt-2 md:pt-0">
              <div>
                <span className="text-gray-900 font-bold block">30-Day ML Projection</span>
                <span className="text-[11px] text-gray-500 font-mono">{fmt(analytics.mlForecast.projectedBalance30Days)}</span>
              </div>
              <div>
                <span className="text-gray-900 font-bold block">{analytics.mlForecast.trendDirection.toUpperCase()}</span>
                <span className="text-[11px] text-gray-500">Trend Direction</span>
              </div>
            </div>
          </div>

          {/* ═══ TAB 1: EXECUTIVE OVERVIEW ═══ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* High-Density KPI Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Account Balance */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">Account Balance</span>
                  <div className="text-2xl font-bold font-mono text-gray-900 tracking-tight">{fmt(analytics.currentBalance)}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2 font-sans">
                    <span>Open: {fmt(analytics.openingBalance)}</span>
                    <span className="font-semibold text-gray-900">Close: {fmt(analytics.closingBalance)}</span>
                  </div>
                </div>

                {/* Total Income */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">
                    {excludeTransfers ? "Operating Income" : "Total Income"}
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-600 tracking-tight">+{fmt(analytics.totalIncome)}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2 font-sans">
                    <span>Avg/Day: {fmt(analytics.avgDailyIncome, true)}</span>
                    <span>{analytics.totalCredits} credits</span>
                  </div>
                </div>

                {/* Total Expenses */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">
                    {excludeTransfers ? "Operating Expenses" : "Total Expenses"}
                  </span>
                  <div className="text-2xl font-bold font-mono text-gray-900 tracking-tight">-{fmt(analytics.totalExpenses)}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2 font-sans">
                    <span>Avg/Day: {fmt(analytics.avgDailySpending, true)}</span>
                    <span>{analytics.totalDebits} debits</span>
                  </div>
                </div>

                {/* Net Cash Flow */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">
                    {excludeTransfers ? "Net Operating Cash" : "Net Cash Flow"}
                  </span>
                  <div className="text-2xl font-bold font-mono tracking-tight text-gray-900">
                    {analytics.netCashFlow >= 0 ? "+" : ""}{fmt(analytics.netCashFlow)}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2 font-sans">
                    <span>Savings: {analytics.totalIncome > 0 ? ((analytics.netCashFlow / analytics.totalIncome) * 100).toFixed(1) : "0"}%</span>
                    <span className="font-semibold text-gray-900">
                      {analytics.cashFlowTrend === "improving" ? "↑ Improving" : analytics.cashFlowTrend === "declining" ? "↓ Declining" : "→ Stable"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Score + Running Balance Trajectory Chart */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Health Score Panel */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                        <Award className="h-4 w-4 text-black" />
                        Financial Health Score
                      </h3>
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-bold font-mono text-black">
                        Grade {healthScore.grade}
                      </span>
                    </div>
                    <div className="mt-5 flex flex-col items-center">
                      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-black shadow-xs">
                        <div className="text-center">
                          <span className="text-2xl font-bold font-mono text-gray-900">{healthScore.score}</span>
                          <span className="text-[10px] text-gray-400 block">/ 100</span>
                        </div>
                      </div>
                      <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-gray-900">{healthScore.tier} Status ({healthScore.confidenceScore}% Confidence)</span>
                      <p className="mt-1 text-xs text-center text-gray-600 leading-relaxed px-1">{healthScore.summary}</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2 border-t border-gray-100 pt-3">
                    {healthScore.factors.map((factor) => (
                      <div key={factor.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 font-medium">{factor.name}</span>
                          <span className="font-bold font-mono text-gray-900">{factor.score} / {factor.maxScore}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-black rounded-full transition-all" style={{ width: `${(factor.score / factor.maxScore) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Running Balance Area Chart */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900">Running Balance Trajectory</h3>
                      <p className="text-xs text-gray-500 font-sans mt-0.5">
                        {analytics.statementPeriod.start} → {analytics.statementPeriod.end} ({analytics.currency.symbol})
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-sans">
                      <span className="text-gray-900 font-medium">{analytics.positiveDaysCount} surplus days</span>
                      <span className="text-gray-500">{analytics.negativeDaysCount} deficit days</span>
                    </div>
                  </div>
                  <div className="mt-4 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#000000" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" className="text-[10px] text-gray-500 font-sans" tickLine={false} />
                        <YAxis className="text-[10px] text-gray-500 font-sans" tickLine={false} tickFormatter={(v) => `${analytics.currency.symbol}${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "0.75rem", color: "#0f172a", fontSize: "11px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} formatter={(value) => [fmt(Number(value)), "Balance"]} />
                        <Area type="monotone" dataKey="runningBalance" stroke="#000000" strokeWidth={2} fillOpacity={1} fill="url(#balanceGrad)" name="Running Balance" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB 2: CLIENT-SIDE ML MODELS ═══ */}
          {activeTab === "ml" && (
            <div className="space-y-6">
              {/* 30-Day ML Balance Forecast Chart */}
              <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-black" />
                      30-Day Client ML Balance Forecast (Linear Regression)
                    </h3>
                    <p className="text-xs text-gray-500 font-sans mt-0.5">
                      Calculated 100% in-browser &middot; Fit Confidence $R^2 = {analytics.mlForecast.rSquared}$ &middot; Slope: {fmt(analytics.mlForecast.dailySlope)}/day
                    </p>
                  </div>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold font-mono text-black">
                    T+30 Forecast: {fmt(analytics.mlForecast.projectedBalance30Days)}
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.mlForecast.forecastPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mlForecastGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" className="text-[10px] text-gray-500 font-sans" tickLine={false} />
                      <YAxis className="text-[10px] text-gray-500 font-sans" tickLine={false} tickFormatter={(v) => `${analytics.currency.symbol}${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "0.75rem", color: "#0f172a", fontSize: "11px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} formatter={(val) => fmt(Number(val))} />
                      <Area type="monotone" dataKey="projectedBalance" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#mlForecastGrad)" name="ML Projected Balance" />
                      <Area type="monotone" dataKey="upperBound" stroke="#94a3b8" strokeDasharray="3 3" fill="none" name="+95% Upper Bound" />
                      <Area type="monotone" dataKey="lowerBound" stroke="#cbd5e1" strokeDasharray="3 3" fill="none" name="-95% Lower Bound" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Client-Side TF-IDF Payee Classification & Anomaly Detection Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* TF-IDF Payee Classification Table */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
                  <h3 className="font-semibold text-sm text-gray-900 border-b border-gray-100 pb-3 mb-4">
                    TF-IDF + Cosine Similarity Payee Classification
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {analytics.enrichedTransactions.slice(0, 10).map((tx) => {
                      const pred = classifyTextML(tx.rawDescription);
                      return (
                        <div key={tx.id} className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-3 flex items-center justify-between text-xs font-sans">
                          <div>
                            <span className="text-gray-900 font-semibold block truncate max-w-[180px]">{tx.description}</span>
                            <span className="text-gray-500 text-[11px]">{pred.method} &middot; tokens: [{pred.topFeatures.join(", ")}]</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-900 font-bold block">{pred.category}</span>
                            <span className="text-emerald-600 font-medium text-[11px]">{pred.confidenceScore}% ML confidence</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Multivariate Anomaly Detection Scores */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
                  <h3 className="font-semibold text-sm text-gray-900 border-b border-gray-100 pb-3 mb-4">
                    Multivariate ML Anomaly Scores
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {analytics.mlAnomalyScores.slice(0, 10).map((mlScore) => {
                      const tx = analytics.enrichedTransactions.find((t) => t.id === mlScore.transactionId);
                      if (!tx) return null;
                      return (
                        <div key={mlScore.transactionId} className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-3 flex items-center justify-between text-xs font-sans">
                          <div>
                            <span className="text-gray-900 font-semibold block truncate max-w-[180px]">{tx.description}</span>
                            <span className="text-gray-500 text-[11px]">{mlScore.features.join(" &middot; ")}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-900 font-bold font-mono block">{fmt(tx.amount)}</span>
                            <span className="text-amber-600 font-medium text-[11px]">{mlScore.anomalyScore}% Risk Score</span>
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
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
                <h3 className="font-semibold text-sm text-gray-900 border-b border-gray-100 pb-3 mb-4">Daily Income vs Expenses ({analytics.currency.symbol})</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" className="text-[10px] text-gray-500 font-sans" tickLine={false} />
                      <YAxis className="text-[10px] text-gray-500 font-sans" tickLine={false} tickFormatter={(v) => `${analytics.currency.symbol}${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "0.75rem", color: "#0f172a", fontSize: "11px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} formatter={(val) => fmt(Number(val))} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#000000" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {analytics.monthlyBreakdown.length > 0 && (
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
                  <h3 className="font-semibold text-sm text-gray-900 border-b border-gray-100 pb-3 mb-4">Monthly Cash Flow Summary</h3>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.monthlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" className="text-[10px] text-gray-500 font-sans" tickLine={false} />
                        <YAxis className="text-[10px] text-gray-500 font-sans" tickLine={false} tickFormatter={(v) => `${analytics.currency.symbol}${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "0.75rem", color: "#0f172a", fontSize: "11px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} formatter={(val) => fmt(Number(val))} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#000000" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="net" name="Net" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ═══ YEARLY CASH FLOW SUMMARY ═══ */}
              {analytics.yearlyBreakdown.length > 0 && (
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <h3 className="font-semibold text-sm text-gray-900">Yearly Cash Flow Breakdown ({analytics.currency.symbol})</h3>
                    <span className="text-xs text-gray-500 font-sans">
                      {analytics.yearlyBreakdown.length} year(s) analyzed
                    </span>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.yearlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="year" className="text-[10px] text-gray-500 font-sans" tickLine={false} />
                        <YAxis className="text-[10px] text-gray-500 font-sans" tickLine={false} tickFormatter={(v) => `${analytics.currency.symbol}${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "0.75rem", color: "#0f172a", fontSize: "11px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} formatter={(val) => fmt(Number(val))} />
                        <Legend />
                        <Bar dataKey="income" name="Yearly Income" fill="#000000" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" name="Yearly Expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="net" name="Net Cash Flow" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2.5">Year</th>
                          <th className="px-4 py-2.5 text-right">Income</th>
                          <th className="px-4 py-2.5 text-right">Expenses</th>
                          <th className="px-4 py-2.5 text-right">Net Cash Flow</th>
                          <th className="px-4 py-2.5 text-right">Txns</th>
                          <th className="px-4 py-2.5 text-right">Savings Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {analytics.yearlyBreakdown.map((y) => (
                          <tr key={y.year} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-gray-900">{y.year}</td>
                            <td className="px-4 py-2.5 text-right text-emerald-600 font-bold font-mono">+{fmt(y.income)}</td>
                            <td className="px-4 py-2.5 text-right text-gray-700 font-mono">-{fmt(y.expenses)}</td>
                            <td className="px-4 py-2.5 text-right text-gray-900 font-bold font-mono">{y.net >= 0 ? "+" : ""}{fmt(y.net)}</td>
                            <td className="px-4 py-2.5 text-right text-gray-500 font-mono">{y.transactionCount}</td>
                            <td className="px-4 py-2.5 text-right text-gray-900 font-bold font-mono">{y.savingsRate}%</td>
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
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-black" />
                    Salary & Payroll Detection
                  </h3>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-900">
                    {analytics.salaryInfo.detected ? "Salary Verified" : "No Regular Salary Pattern"}
                  </span>
                </div>
                {analytics.salaryInfo.detected && (
                  <div className="grid gap-3 sm:grid-cols-4 font-sans text-xs">
                    <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-3.5">
                      <span className="text-gray-500 uppercase text-[10px] font-semibold block">Employer</span>
                      <span className="font-bold text-gray-900 text-sm mt-1 block">{analytics.salaryInfo.employer}</span>
                    </div>
                    <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-3.5">
                      <span className="text-gray-500 uppercase text-[10px] font-semibold block">Avg Paycheck</span>
                      <span className="font-bold text-gray-900 text-sm mt-1 block font-mono">{fmt(analytics.salaryInfo.avgAmount)}</span>
                    </div>
                    <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-3.5">
                      <span className="text-gray-500 uppercase text-[10px] font-semibold block">Frequency</span>
                      <span className="font-bold text-gray-900 text-sm mt-1 block">{analytics.salaryInfo.frequency}</span>
                    </div>
                    <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-3.5">
                      <span className="text-gray-500 uppercase text-[10px] font-semibold block">Total Salary</span>
                      <span className="font-bold text-gray-900 text-sm mt-1 block font-mono">{fmt(analytics.salaryInfo.totalSalary)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ TAB 5: CATEGORIES ═══ */}
          {activeTab === "categories" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {analytics.categoryBreakdown.map((cat, idx) => (
                <div key={cat.category} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-semibold text-xs text-gray-900 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MONOCHROME_DONUT_COLORS[idx % MONOCHROME_DONUT_COLORS.length] }} />
                      {cat.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-500">{cat.percentage}%</span>
                  </div>
                  <div className="flex items-baseline justify-between font-sans">
                    <span className="text-lg font-bold text-gray-900 font-mono">{fmt(cat.total)}</span>
                    <span className="text-xs text-gray-500">{cat.count} txns</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-black" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ TAB 6: TRANSACTION LEDGER ═══ */}
          {activeTab === "transactions" && (
            <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">Enriched Transaction Ledger</h3>
                  <p className="text-xs text-gray-500 font-sans mt-0.5">
                    {filteredTransactions.length} of {analytics.totalTransactions} shown · Click category badge to reclassify
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search payee..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="rounded-full border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black w-40 md:w-56"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="all">All Categories</option>
                    {analytics.categoryBreakdown.map((c) => (
                      <option key={c.category} value={c.category}>{c.category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Payee / Merchant</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTransactions.slice(0, 100).map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-mono">{tx.date}</td>
                        <td className="px-4 py-3 font-medium">
                          <span className="font-bold text-gray-900">{tx.description}</span>
                          {tx.rawDescription !== tx.description && (
                            <span className="text-[11px] text-gray-400 block font-mono truncate max-w-xs">{tx.rawDescription}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={tx.category}
                            onChange={(e) => setCategoryOverride(tx.id, e.target.value as TransactionCategory)}
                            className="rounded-full px-2.5 py-1 text-[11px] font-semibold border border-gray-200 bg-gray-100 text-gray-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black"
                          >
                            {ALL_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat} className="bg-white text-gray-900 font-sans">{cat}</option>
                            ))}
                          </select>
                        </td>
                        <td className={`px-4 py-3 text-right font-bold font-mono whitespace-nowrap ${tx.type === "credit" ? "text-emerald-600" : "text-gray-900"}`}>
                          {tx.type === "credit" ? "+" : "-"}{fmt(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 font-mono whitespace-nowrap">
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
