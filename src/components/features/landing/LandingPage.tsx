"use client";

import { useState, useEffect } from "react";
import {
  Star,
  ChevronDown,
  BarChart3,
  BookOpen,
  Users,
  Rocket,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Terminal,
  Cpu,
  Layers,
  HelpCircle,
  Play,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Bot,
  LineChart,
  Award,
  FileCheck,
  Building2,
  CreditCard,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useDataStore } from "@/stores/data-store";
import { getSampleDataset } from "@/lib/analytics/sample-data";

interface LandingPageProps {
  onStartUpload: () => void;
}

const TABS = [
  { id: "analyse", label: "Analyse", icon: BarChart3 },
  { id: "train", label: "Train", icon: BookOpen },
  { id: "testing", label: "Testing", icon: Users },
  { id: "deploy", label: "Deploy", icon: Rocket },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function LandingPage({ onStartUpload }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("analyse");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const setDataset = useDataStore((s) => s.setDataset);

  // Auto-cycle tabs every 4s using setInterval as specified
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = TABS.findIndex((t) => t.id === current);
        const nextIndex = (currentIndex + 1) % TABS.length;
        return TABS[nextIndex].id;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleLoadDemo = () => {
    setDataset(getSampleDataset());
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* ═══ NAVIGATION (animationDelay: 0.1s) ═══ */}
      <header
        className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 animate-fade-in-up"
        style={{ animationDelay: "0.1s", opacity: 0 }}
      >
        {/* Left: Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Star className="w-5 h-5 fill-black text-black" />
          <span className="text-lg font-semibold tracking-tight text-black">
            Vanguard AI Platform
          </span>
          <span className="text-[10px] font-mono font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200 hidden sm:inline-block">
            STELLAR ENGINE
          </span>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#capabilities"
            className="text-sm text-gray-700 hover:text-black transition-colors font-medium"
          >
            Capabilities
          </a>
          <a
            href="#health-score"
            className="text-sm text-gray-700 hover:text-black transition-colors font-medium"
          >
            Health Engine
          </a>
          <a
            href="#workflow"
            className="text-sm text-gray-700 hover:text-black transition-colors font-medium"
          >
            Workflow
          </a>
          <a
            href="#faq"
            className="text-sm text-gray-700 hover:text-black transition-colors font-medium"
          >
            FAQ
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLoadDemo}
            className="text-sm text-gray-700 hover:text-black font-semibold transition-colors hidden sm:block"
          >
            Try Demo
          </button>
          <button
            onClick={onStartUpload}
            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Start Audit Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══ HERO SECTION (px-6 pt-24 pb-32 max-w-7xl mx-auto text-center) ═══ */}
      <section className="px-6 pt-24 pb-32 max-w-7xl mx-auto text-center">
        {/* Reviews Badge (delay: 0.2s) */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          <div className="w-5 h-5 border border-gray-300 rounded-full flex items-center justify-center bg-white shadow-2xs">
            <Star className="w-3 h-3 fill-black text-black" />
          </div>
          <span className="text-xs font-semibold text-gray-900">
            100% Client Privacy &middot; 0 API Fees &middot; 18.3K+ Auditors Trust Vanguard
          </span>
        </div>

        {/* Main Heading (delay: 0.3s) */}
        <h1
          className="text-5xl sm:text-7xl lg:text-[80px] font-normal leading-[1.1] tracking-tight mb-6 animate-fade-in-up"
          style={{ animationDelay: "0.3s", opacity: 0 }}
        >
          <span className="block text-black">Institutional Bank Analytics.</span>
          <span className="bg-gradient-to-r from-black via-gray-600 to-gray-400 bg-clip-text text-transparent block font-medium">
            100% In-Browser Machine Learning.
          </span>
        </h1>

        {/* Subheading (delay: 0.4s) */}
        <p
          className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          Transform raw PDF bank statements, CSV ledgers, and Excel workbooks into audit-grade financial dashboards. Deterministic balance math auditing, 30-day ML forecasting, and payee classification with zero server data risk.
        </p>

        {/* CTA Buttons (delay: 0.5s) */}
        <div
          className="mb-14 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.5s", opacity: 0 }}
        >
          <button
            onClick={onStartUpload}
            className="bg-black text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-gray-800 transition-all shadow-lg inline-flex items-center gap-2.5"
          >
            <Upload className="w-5 h-5 text-white" />
            <span>Upload Statement — Free Instant Audit</span>
          </button>
          <button
            onClick={handleLoadDemo}
            className="bg-gray-100 text-gray-900 border border-gray-300 px-8 py-3.5 rounded-full text-base font-semibold hover:bg-gray-200 transition-all inline-flex items-center gap-2.5"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Try Interactive Sample Demo</span>
          </button>
        </div>

        {/* Tab Bar (delay: 0.6s) */}
        <div
          className="mb-8 max-w-md md:max-w-xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          {/* Mobile (md:hidden): 2x2 grid with 4 buttons */}
          <div className="md:hidden grid grid-cols-2 gap-1 bg-gray-100 rounded-lg p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop (hidden md:flex): Same 4 buttons in row with vertical dividers */}
          <div className="hidden md:flex items-center justify-center bg-gray-100 rounded-lg p-1 border border-gray-200/60">
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div key={tab.id} className="flex items-center">
                  {idx > 0 && <div className="w-px h-5 bg-gray-300 mx-1" />}
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video + Overlay Section (delay: 0.7s) */}
        <div
          className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px] shadow-2xl border border-gray-200/80 animate-fade-in-up"
          style={{ animationDelay: "0.7s", opacity: 0 }}
        >
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

          {/* 4 Conditional Overlays per tab with animate-fade-in-overlay outer and animate-slide-up-overlay inner card */}
          {activeTab === "analyse" && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in-overlay">
              <div className="absolute top-1/2 left-1/2 animate-slide-up-overlay bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-100 max-w-md w-[90%] text-left text-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block">
                      Document AI & Audit Pipeline
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      Pre-Analysis Data Hygiene Audit
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <FileCheck className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Parsing balance math: Prev Balance ± Amount = New Balance.
                </p>

                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: "25%" }}
                  />
                </div>

                <div className="space-y-3 font-sans">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-purple-50/60 border border-purple-100">
                    <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-medium text-purple-900">
                      1. Document AI Classifier: Bank Statement
                    </span>
                    <span className="ml-auto text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
                      98% Conf
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="w-5 h-5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                    <span className="text-xs font-medium text-gray-800">
                      2. Balance Math Audit Scanning
                    </span>
                    <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/50 opacity-60">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                      3
                    </div>
                    <span className="text-xs text-gray-600">
                      3. Duplicate & Corrupted Date Check
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/50 opacity-60">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                      4
                    </div>
                    <span className="text-xs text-gray-600">
                      4. Operating Cash Flow Mode Isolation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "train" && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in-overlay">
              <div className="absolute top-1/2 left-1/2 animate-slide-up-overlay bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-100 max-w-md w-[90%] text-left text-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider block">
                      In-Browser Machine Learning
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      TF-IDF & Linear Regression Models
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Extracting payee embeddings & fitting 30-day linear regression slope.
                </p>

                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: "67%" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                    <span className="text-[10px] text-gray-500 font-medium block">
                      MODEL FIT (R²)
                    </span>
                    <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                      0.942
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                    <span className="text-[10px] text-gray-500 font-medium block">
                      CLASSIFIER CONF.
                    </span>
                    <span className="text-lg font-bold text-orange-600 mt-0.5 block">
                      99.4%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-medium block">
                      ANOMALY PROBABILITY
                    </span>
                    <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                      0.012
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-medium block">
                      TOKENS PARSED
                    </span>
                    <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                      1.2k tok/s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "testing" && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in-overlay">
              <div className="absolute top-1/2 left-1/2 animate-slide-up-overlay bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-100 max-w-md w-[90%] text-left text-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
                      Deterministic Safety Rules
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      16 Exact-Number Insights
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-emerald-950 block">
                      127 Audit Checks Passed
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Zero math discrepancies or corrupted rows
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Salary Arrival Window</span>
                    <span className="font-semibold text-emerald-600">Verified (Monthly 25th)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Merchant Concentration HHI</span>
                    <span className="font-semibold text-emerald-600">0.12 (Low Risk)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Liquidity Volatility Factor</span>
                    <span className="font-semibold text-emerald-600">Stable (CV &lt; 0.35)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "deploy" && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in-overlay">
              <div className="absolute top-1/2 left-1/2 animate-slide-up-overlay bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-100 max-w-md w-[90%] text-left text-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
                      Client-Side Privacy Architecture
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      100% In-Browser Execution
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Rocket className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-xs font-medium text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Zero Remote API Leaks (GDPR & NDPR Compliant)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>In-Browser WebAssembly & Worker Parsing</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Global Currency & Bank Brand Detection</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Operating Cash Flow Transfer Isolation</span>
                  </div>
                </div>

                <button
                  onClick={onStartUpload}
                  className="bg-black text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors w-full flex items-center justify-center gap-2 shadow-md"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Launch Dashboard Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Company Logos (delay: 0.8s) */}
        <div
          className="mt-24 flex flex-wrap items-center justify-center md:justify-between gap-8 md:gap-12 px-6 animate-fade-in-up"
          style={{ animationDelay: "0.8s", opacity: 0 }}
        >
          <div className="flex items-center gap-1.5 font-bold tracking-widest text-gray-400 text-lg hover:text-black transition-colors cursor-pointer">
            <span className="font-black">INTERSCOPE</span>
          </div>

          <div className="flex items-center gap-2 font-bold tracking-tight text-gray-400 text-lg hover:text-black transition-colors cursor-pointer">
            <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-[10px] font-black">
              ≈
            </div>
            <span>Spotify</span>
          </div>

          <div className="flex items-center gap-2 font-semibold text-gray-400 text-lg hover:text-black transition-colors cursor-pointer">
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="bg-gray-400 rounded-full w-1.5 h-1.5" />
              <div className="bg-gray-400 rounded-full w-1.5 h-1.5" />
              <div className="bg-gray-400 rounded-full w-1.5 h-1.5" />
              <div className="bg-gray-400 rounded-full w-1.5 h-1.5" />
            </div>
            <span>Nexera</span>
          </div>

          <div className="font-serif italic font-bold text-gray-400 text-2xl hover:text-black transition-colors cursor-pointer">
            M3
          </div>

          <div className="flex items-center gap-2 font-medium tracking-wide text-gray-400 text-base hover:text-black transition-colors cursor-pointer">
            <div className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-[10px] font-bold">
              LC
            </div>
            <span>LAURA COLE</span>
          </div>

          <div className="flex items-center gap-2 font-bold text-gray-400 text-lg hover:text-black transition-colors cursor-pointer">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
            <span>vertex</span>
          </div>
        </div>
      </section>

      {/* ═══ CAPABILITIES GRID (README HIGHLIGHTS) (delay: 0.9s) ═══ */}
      <section
        id="capabilities"
        className="py-24 px-6 bg-gray-50/60 border-y border-gray-100 animate-fade-in-up"
        style={{ animationDelay: "0.9s", opacity: 0 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 block">
              Technical Highlights & Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-gray-900 mb-4">
              Audit-grade analytics with zero server dependency
            </h2>
            <p className="text-base text-gray-600">
              Vanguard operates 100% inside your web browser using WebAssembly parsing, sparse vector TF-IDF embeddings, linear regression time-series forecasting, and 16+ deterministic exact-number rules.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "100% In-Browser Privacy",
                desc: "Financial files are parsed, validated, and analyzed entirely in client memory. Zero data is ever sent to external cloud APIs or third-party servers.",
                badge: "Zero Latency",
              },
              {
                icon: Cpu,
                title: "Browser Machine Learning",
                desc: "Sparse Bag-of-Words TF-IDF vector similarity classifies payees into 20+ categories with ML confidence scores.",
                badge: "TF-IDF + Cosine",
              },
              {
                icon: TrendingUp,
                title: "30-Day Time-Series ML Forecaster",
                desc: "Linear regression model fits daily cash flow momentum to calculate R² fit confidence, velocity slope, and 95% confidence bounds.",
                badge: "Linear Regression",
              },
              {
                icon: FileCheck,
                title: "Document AI Classifier",
                desc: "Automatically detects document type (Bank Statement, General Ledger, Invoice, Payroll, Sales Report) with confidence ratings.",
                badge: "Auto-Detect",
              },
              {
                icon: LineChart,
                title: "Audit-Grade Deterministic Engine",
                desc: "100% exact math calculations for opening/closing balance verification, operating vs gross cash flow, and merchant HHI concentration.",
                badge: "100% Exact Math",
              },
              {
                icon: Globe,
                title: "Global Currency & Bank Recognition",
                desc: "Frequency-weighted currency detection for NGN ₦, GBP £, EUR €, USD $, CAD C$, AUD A$, ZAR R, KES KSh, GHS GH₵, AED, and JPY ¥.",
                badge: "11+ Currencies",
              },
            ].map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
                      <ItemIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 6-FACTOR FINANCIAL HEALTH SCORING (delay: 1.0s) ═══ */}
      <section
        id="health-score"
        className="py-24 px-6 max-w-7xl mx-auto animate-fade-in-up"
        style={{ animationDelay: "1.0s", opacity: 0 }}
      >
        <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium mb-6 backdrop-blur-md">
                <Award className="w-3.5 h-3.5" />
                <span>6-Factor Financial Health Score</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight mb-6">
                Institutional Risk & Performance Rating
              </h2>
              <p className="text-gray-300 text-base leading-relaxed mb-8">
                Evaluates savings rate, cash reserves volatility, income consistency, overdraft safety, top merchant HHI concentration, and pre-analysis ledger quality to assign a Grade (A+ to D) with risk levels.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleLoadDemo}
                  className="bg-white text-black px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Test Sample Health Rating</span>
                </button>
                <button
                  onClick={onStartUpload}
                  className="border border-gray-700 bg-gray-800/80 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <span>Upload Statement Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Health Score Pillar Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              {[
                { name: "Savings Rate", max: "25 pts", desc: "Retained Net Surplus Ratio" },
                { name: "Cash Volatility", max: "20 pts", desc: "Coefficient of Variation" },
                { name: "Income Consistency", max: "20 pts", desc: "Payroll Cycle & Source Diversification" },
                { name: "Account Safety", max: "15 pts", desc: "Overdraft & Deficit Day Audit" },
                { name: "Merchant Concentration", max: "10 pts", desc: "HHI Index & Top 3 Payee Share" },
                { name: "Ledger Quality", max: "10 pts", desc: "Balance Math Validation Score" },
              ].map((p, i) => (
                <div key={i} className="bg-gray-950/80 border border-gray-800 p-4 rounded-xl backdrop-blur-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-bold">{p.name}</span>
                    <span className="text-emerald-400 text-[10px]">{p.max}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3-STEP WORKFLOW (delay: 1.1s) ═══ */}
      <section
        id="workflow"
        className="py-24 px-6 bg-white border-t border-gray-100 animate-fade-in-up"
        style={{ animationDelay: "1.1s", opacity: 0 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 block">
              Simplified 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              Three-Step Audit & Analytics Workflow
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Import Bank Ledger",
                desc: "Drop any PDF bank statement, CSV transaction export, or XLSX Excel file. Parsed 100% locally in browser memory.",
              },
              {
                step: "02",
                title: "Automated Data Hygiene",
                desc: "Scans balance math (Prev ± Amt = New), verifies date integrity, isolates transfers, and tags anomalies.",
              },
              {
                step: "03",
                title: "Executive Dashboard",
                desc: "Explore running balance charts, category breakdowns, health ratings, 30-day forecasts, and export CSV/PDF reports.",
              },
            ].map((st, i) => (
              <div
                key={i}
                className="bg-gray-50/80 border border-gray-200/80 p-8 rounded-2xl space-y-3"
              >
                <span className="text-4xl font-light text-gray-300 block font-mono">
                  {st.step}
                </span>
                <h3 className="text-xl font-semibold text-gray-900">
                  {st.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ACCORDION (delay: 1.2s) ═══ */}
      <section
        id="faq"
        className="py-24 px-6 bg-gray-50/50 border-t border-gray-100 animate-fade-in-up"
        style={{ animationDelay: "1.2s", opacity: 0 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-600">
              Everything you need to know about privacy, calculations, and machine learning models.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is my financial or bank statement data uploaded to any server?",
                a: "No. Vanguard operates 100% in your local browser session using WebAssembly parsers, TF-IDF vector embeddings, and client-side calculations. Your files never touch any external backend server or third-party AI API.",
              },
              {
                q: "What file formats are supported?",
                a: "Supports PDF bank statements from major international and regional banks, CSV transaction exports, and Microsoft Excel (.xlsx/.xls) financial reports.",
              },
              {
                q: "How does Operating Cash Flow mode work?",
                a: "Operating Mode isolates internal account movements (e.g., transfers between your checking and savings vaults or Safelock accounts) so gross cash flow is not artificially inflated.",
              },
              {
                q: "How does the 30-Day Time-Series ML Balance Forecaster work?",
                a: "It fits daily balance history using a linear regression model (ŷ = β₀ + β₁x) to calculate trend direction, velocity slope, model fit confidence (R²), and 95% statistical confidence bounds.",
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-semibold text-gray-900 text-base">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-black" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER (delay: 1.3s) ═══ */}
      <section
        className="py-20 px-6 max-w-7xl mx-auto animate-fade-in-up"
        style={{ animationDelay: "1.3s", opacity: 0 }}
      >
        <div className="bg-black text-white rounded-3xl p-10 sm:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-4xl sm:text-5xl font-normal leading-tight tracking-tight">
              Audit Your Bank Statement Now — Zero Data Exposure.
            </h2>
            <p className="text-gray-400 text-base">
              Join 18.3K+ financial analysts running audit-grade in-browser analytics today.
            </p>
            <div className="pt-2 flex items-center justify-center gap-4">
              <button
                onClick={onStartUpload}
                className="bg-white text-black px-8 py-3.5 rounded-full text-base font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Upload Statement Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER (delay: 1.4s) ═══ */}
      <footer
        className="border-t border-gray-200 py-12 px-6 max-w-7xl mx-auto text-sm text-gray-500 animate-fade-in-up"
        style={{ animationDelay: "1.4s", opacity: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-black text-black" />
            <span className="font-semibold text-gray-900">Vanguard AI Platform</span>
            <span className="text-xs text-gray-400">
              © {new Date().getFullYear()} Vanguard Financial Analytics Engine. 100% Client-Side Privacy.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-600">
            <a href="#capabilities" className="hover:text-black transition-colors">
              Privacy Architecture
            </a>
            <a href="#health-score" className="hover:text-black transition-colors">
              Health Scoring
            </a>
            <a href="#faq" className="hover:text-black transition-colors">
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
