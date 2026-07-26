"use client";

import {
  ShieldCheck,
  Zap,
  Upload,
  BarChart3,
  ArrowRight,
  FileCheck,
  Lock,
  Building2,
  CreditCard,
  Layers,
  RefreshCw,
  HelpCircle,
  Wallet,
} from "lucide-react";
import { useDataStore } from "@/stores/data-store";
import { getSampleDataset } from "@/lib/analytics/sample-data";

interface LandingPageProps {
  onStartUpload: () => void;
}

export function LandingPage({ onStartUpload }: LandingPageProps) {
  const setDataset = useDataStore((s) => s.setDataset);

  const handleLoadDemo = () => {
    setDataset(getSampleDataset());
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* ═══ NAVIGATION BAR ═══ */}
      <nav className="sticky top-0 z-50 fintech-header px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded bg-white flex items-center justify-center text-black">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block leading-none">Vanguard Engine</span>
              <span className="text-[9px] text-neutral-400 font-mono">FINANCIAL ANALYTICS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-300">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadDemo}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors border border-neutral-800 rounded bg-neutral-900 hover:bg-neutral-800"
            >
              Try Sample Demo
            </button>
            <button
              onClick={onStartUpload}
              className="px-3.5 py-1.5 text-xs font-semibold text-black bg-white rounded hover:bg-neutral-200 transition-all flex items-center gap-1.5"
            >
              Upload Statement <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="pt-16 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 text-xs font-mono mb-6">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
            100% Client-Side Privacy &middot; Zero API Dependencies
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-white">
            Institutional Financial Analytics for Bank Statements & Reports.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Deterministic balance math auditing, document classification, liquidity volatility profiling, and anomaly detection.
          </p>

          {/* Action Triggers */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartUpload}
              className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-black bg-white hover:bg-neutral-200 rounded transition-all flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Statement (PDF / CSV / Excel)
            </button>
            <button
              onClick={handleLoadDemo}
              className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-neutral-200 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 rounded transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="h-4 w-4 text-white" />
              Load Interactive Demo Dataset
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-neutral-500 font-mono">
            <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-white" /> In-Browser Privacy</span>
            <span className="flex items-center gap-1"><FileCheck className="h-3 w-3 text-white" /> Ledger Hygiene Audit</span>
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3 text-white" /> Operating Cash Flow</span>
          </div>
        </div>

        {/* High-Density Product Mock */}
        <div className="mt-12 max-w-5xl mx-auto rounded border border-neutral-800 bg-[#0a0a0a] p-4 shadow-xl text-left">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4 font-mono text-xs text-neutral-400">
            <span>vanguard-ledger-audit // Statement_2026.pdf</span>
            <span className="text-white font-bold">Grade A+ (100% Quality Score)</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-4 font-mono text-xs mb-4">
            <div className="bg-black border border-neutral-800 p-3 rounded">
              <span className="text-neutral-500 block text-[10px]">CURRENT BALANCE</span>
              <span className="text-lg font-bold text-white mt-0.5 block">₦1,230,350.00</span>
            </div>
            <div className="bg-black border border-neutral-800 p-3 rounded">
              <span className="text-neutral-500 block text-[10px]">OPERATING INCOME</span>
              <span className="text-lg font-bold text-white mt-0.5 block">+₦1,665,000.00</span>
            </div>
            <div className="bg-black border border-neutral-800 p-3 rounded">
              <span className="text-neutral-500 block text-[10px]">OPERATING EXPENSES</span>
              <span className="text-lg font-bold text-neutral-300 mt-0.5 block">-₦1,184,650.00</span>
            </div>
            <div className="bg-black border border-neutral-800 p-3 rounded">
              <span className="text-neutral-500 block text-[10px]">HEALTH SCORE</span>
              <span className="text-lg font-bold text-white mt-0.5 block">88 / 100</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COMPATIBILITY STRIP ═══ */}
      <section className="py-8 border-y border-neutral-800 bg-[#0a0a0a] text-center font-mono text-xs text-neutral-400">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8">
          <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-white" /> MERCURY STATEMENTS</span>
          <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-white" /> RAMP EXPORTS</span>
          <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-white" /> STRIPE REPORTS</span>
          <span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5 text-white" /> GENERAL LEDGERS</span>
        </div>
      </section>

      {/* ═══ CAPABILITIES GRID ═══ */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-white">Institutional Analytical Capabilities</h2>
            <p className="text-xs text-neutral-400 mt-1">Built with mathematical determinism and strict data validation.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Pre-Analysis Data Audit", desc: "Validates row balance math (Prev Balance ± Txn = New Balance), flags unparseable dates and duplicate rows." },
              { title: "Document Classification", desc: "Identifies Bank Statements, General Ledgers, Invoices, and Sales Reports with confidence ratings." },
              { title: "Operating Cash Flow Mode", desc: "Excludes internal account transfers (savings vaults / Safelock) to reveal true operational revenue." },
              { title: "Financial Health Score", desc: "Weighted scoring engine across 6 factor pillars with Risk Level (Low to Critical) & confidence rating." },
              { title: "Channel Volume Analytics", desc: "Tracks ATM usage, POS terminal volume, Cash withdrawals, and Transfer channels automatically." },
              { title: "Merchant HHI Concentration", desc: "Measures payee concentration risk using Herfindahl-Hirschman Index & Top 3 merchant share." },
              { title: "16 Exact-Number Rules", desc: "Generates deterministic rule insights on salary arrival windows, low reserve days, and spending spikes." },
              { title: "Interactive Reclassification", desc: "Reclassify transaction categories with 1 click; dynamically updates charts and health scores." },
            ].map((cap, idx) => (
              <div key={idx} className="rounded border border-neutral-800 bg-[#0a0a0a] p-4 space-y-1.5">
                <h3 className="font-bold text-xs text-white">{cap.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WORKFLOW ═══ */}
      <section id="workflow" className="py-16 px-6 border-t border-neutral-800 bg-black">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-8">Three-Step Analytical Workflow</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Import Ledger", desc: "Drop any CSV, Excel, or PDF bank statement. Runs 100% locally inside browser memory." },
              { step: "02", title: "Automated Data Hygiene", desc: "Verifies balance math, detects document type, checks date integrity, and flags duplicate entries." },
              { step: "03", title: "Executive Dashboard", desc: "Explore interactive balance trajectories, category breakdowns, health scores, and export PDF/CSV reports." },
            ].map((st, i) => (
              <div key={i} className="rounded border border-neutral-800 bg-[#0a0a0a] p-5 space-y-2">
                <span className="text-xs font-mono font-bold text-white">{st.step}</span>
                <h3 className="text-sm font-bold text-white">{st.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Frequently Asked Questions</h2>
          {[
            { q: "Is my financial data sent to any third-party server?", a: "No. Vanguard operates 100% in your local browser memory using Client-Side Parsers & Deterministic Analytics." },
            { q: "What formats are supported?", a: "Supports PDF bank statements, CSV transaction exports, and Microsoft Excel (.xlsx/.xls) financial reports." },
            { q: "How does Operating Cash Flow Mode work?", a: "Operating Mode isolates internal account movements (e.g. transfers into savings vaults) so gross cash flow isn't artificially inflated." },
          ].map((faq, idx) => (
            <div key={idx} className="rounded border border-neutral-800 bg-[#0a0a0a] p-4">
              <h4 className="font-bold text-xs text-white mb-1 flex items-center gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-white" />
                {faq.q}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-6 border-t border-neutral-800 px-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Vanguard Financial Engine. 100% Client-Side Privacy.</span>
          <div className="flex items-center gap-4">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
