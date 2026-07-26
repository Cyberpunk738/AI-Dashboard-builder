# Vanguard Financial Analytics Platform

> **Audit-Grade Client-Side Financial Document Analytics & Browser Machine Learning Engine**
> Built for financial analysts, auditors, CFOs, investors, and banking compliance teams.

![License: MIT](https://img.shields.io/badge/License-MIT-white.svg)
![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-white.svg)
![Browser Machine Learning](https://img.shields.io/badge/Machine%20Learning-Client--Side-white.svg)
![Deployment](https://img.shields.io/badge/Vercel-Frontend--Only-black.svg)

---

## 🌟 Executive Summary

**Vanguard Financial Analytics Platform** transforms uploaded bank statements, PDF reports, CSV ledgers, and Excel workbooks (`.xlsx` / `.xls`) into institutional-grade financial dashboards. 

Unlike traditional SaaS analytics tools that rely on expensive external LLMs or node backend servers, Vanguard operates **100% inside the user's web browser**. It combines **Browser-Based Machine Learning** for document classification and payee entity recognition with **100% Deterministic Financial Calculations** for audit-grade mathematical accuracy.

---

## 🚀 Key Technical Highlights

- **🔒 100% Privacy & Zero Server Latency**: Financial data is parsed, validated, classified, and analyzed entirely in client-side Web Assembly and JavaScript memory. Files are **never** uploaded to any backend server or third-party AI API.
- **🧠 Client-Side Machine Learning Architecture**:
  - **In-Browser TF-IDF + Cosine Vector Similarity**: Extracts token embeddings from raw transaction strings to classify payees into 20+ spending buckets with ML confidence scores.
  - **30-Day Time-Series ML Balance Forecaster**: Fits daily cash flow momentum using Linear Regression ($\hat{y} = \beta_0 + \beta_1 x$) to compute model fit confidence ($R^2$), daily velocity slope, and $\pm 95\%$ confidence bounds.
  - **Multivariate Anomaly Detection Model**: Evaluates multi-dimensional transaction features (amount, recency, category frequency, variance) to compute ML anomaly probability scores (0–100%).
- **📄 Document AI Classifier**: Automatically classifies uploaded files into *Bank Statement*, *Transaction History*, *Expense Report*, *Sales Report*, *Invoice*, *Payroll*, *Financial Statement*, or *Generic Spreadsheet* with confidence ratings.
- **📊 Audit-Grade Deterministic Engine**: 100% exact math calculations for Opening/Closing Balances, Gross vs. Operating Cash Flow (excluding internal transfers), Merchant HHI Concentration, and Savings Rates.
- **🛡️ Pre-Analysis Data Validation & Hygiene Audit**: Pre-scans raw data for balance math discrepancies ($\text{Prev} \pm \text{Amt} = \text{Curr}$), duplicate transactions, corrupted dates, and impossible values before executing analytics algorithms.
- **💱 Global Currency Detection & Formatting**: Frequency-weighted currency detection supporting `NGN ₦`, `GBP £`, `EUR €`, `USD $`, `CAD C$`, `AUD A$`, `INR ₹`, `ZAR R`, `GHS GH₵`, `KES KSh`, `AED`, and `JPY ¥`, with bank brand recognition (GTBank, Zenith, Kuda, OPay, Barclays, HSBC, Chase, etc.).
- **📅 Yearly & Monthly Cash Flow Analytics**: Interactive bar charts and ledger tables breaking down multi-year financial trends.

---

## 🏗️ Architecture Blueprint

The codebase is organized into clean, production-grade modular sub-packages under `/src/lib/`:

```
src/
├── app/
│   ├── layout.tsx                # Global Next.js App Layout with Google Font Poppins
│   ├── page.tsx                  # Application Entry Point
│   └── globals.css               # Monochrome Black & White Theme System & Tabular Fonts
├── components/
│   └── features/
│       ├── fintech/              # Executive Dashboard, Recharts Visualizations, Ledger
│       ├── landing/              # High-Contrast Monochrome Landing Page & Features Grid
│       └── upload/               # Client-Side Drag & Drop File Parser Dropzone
├── lib/
│   ├── ml/
│   │   ├── embeddings.ts         # Sparse Bag-of-Words / TF-IDF Vector Embeddings & Cosine Sim
│   │   ├── transaction-classifier.ts # Hybrid ML Payee Classifier (Shoprite, Uber, Netflix, DStv, etc.)
│   │   ├── time-series-forecaster.ts # Linear Regression 30-Day Balance Trajectory & R² Fit
│   │   └── anomaly-detector.ts   # Multivariate Anomaly Detection Model
│   ├── parser/
│   │   ├── excel.ts              # Smart 2D Matrix Header Scanner & Excel Serial Date Formatter
│   │   ├── pdf.ts                # PDF Geometry & Text Line Extractor (pdfjs-dist)
│   │   └── csv.ts                # Papaparse CSV Stream Parser
│   ├── classifier/
│   │   └── document-classifier.ts # Document AI Classifier & Confidence Scoring
│   ├── validation/
│   │   └── data-validator.ts     # Balance Math Audit & Pre-Analysis Hygiene Validator
│   ├── analyzer/
│   │   └── engine.ts             # 100% Deterministic Financial Calculation Engine
│   ├── statistics/
│   │   └── stats.ts              # Statistical Profile (IQR, StdDev, P25, P75, Variance)
│   └── insights/
│       ├── insights.ts           # 16+ Exact-Number Deterministic Rule Generators
│       └── health-score.ts       # 6-Factor Financial Health & Risk Scoring Engine
└── stores/
    ├── data-store.ts             # Parsed Dataset State Management
    └── dashboard-store.ts        # Operating Mode Toggle & Category Overrides (LocalStorage)
```

---

## 📈 Financial Health Scoring Engine

The platform calculates a **6-Factor Weighted Financial Health Score** (Grade A+ to D) with risk levels (*Low Risk*, *Moderate Risk*, *High Risk*, *Critical Risk*) and data confidence ratings (%):

1. **Savings Rate & Cash Surplus** (Max 25 pts) — Retained net cash flow ratio.
2. **Cash Reserves & Volatility** (Max 20 pts) — Coefficient of Variation & daily surplus count.
3. **Income Consistency & Diversification** (Max 20 pts) — Payroll frequency and source concentration.
4. **Account Safety & Overdraft** (Max 15 pts) — Overdraft frequency and negative balance tracking.
5. **Spending Concentration** (Max 10 pts) — Top 3 merchant expense share and HHI index.
6. **Data & Ledger Quality** (Max 10 pts) — Pre-analysis data validation score.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0 (Strict Mode, 0 compilation errors)
- **Styling**: Vanilla CSS Variables + TailwindCSS (Monochrome Dark Theme)
- **Typography**: Google Font **Poppins** + Monospaced Tabular Numbers (`font-mono tabular-nums`)
- **Data Visualization**: Recharts (High-contrast monochrome charts & Linear Regression trends)
- **File Parsing**: `pdfjs-dist` (PDF), `xlsx` (Excel), `papaparse` (CSV)
- **State Management**: Zustand with LocalStorage Persistence
- **Deployment**: Vercel (100% Static / Edge Client Compatible)

---

## 💻 Local Installation & Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm, pnpm, or yarn

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Cyberpunk738/AI-Dashboard-builder.git
   cd AI-Dashboard-builder
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001`) in your browser.

4. **Verify TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```

---

## 🔒 Security & Privacy Architecture

- **Zero Third-Party Data Exposure**: No user bank statement data ever leaves the local browser session.
- **No External LLM API Keys Required**: Does not rely on OpenAI, Gemini, or Anthropic APIs, eliminating API costs, rate limits, and latency delays.
- **GDPR & NDPR Compliant by Design**: Zero data storage on remote servers ensures full compliance with global financial data privacy regulations.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
