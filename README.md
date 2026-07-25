# Instant Data & Bank Statement Visualizer

An instant, high-performance, **100% client-side** data visualization and bank statement analytics application. Upload any CSV, Excel, or PDF bank statement file (bank account statements, business financial logs, sales records, leads, or fitness data) and get a live, interactive dashboard with financial KPI cards, area trend charts, category bar/pie charts, and interactive data tables—**with zero AI API keys, zero server latency, and 100% data privacy.**

---

## Key Features

- ⚡ **Instant Client-Side Auto-Visualization** — Drag & drop any CSV, Excel, or PDF bank statement file to generate an interactive dashboard instantly in your browser with 0 wait time.
- 🏦 **PDF & Excel Bank Statement Analytics** — Specialized algorithms extract bank statement text and tables (`Debit`, `Credit`, `Amount`, `Income`, `Expense`, `Balance`, `Category`, `Date`) to calculate Net Savings, Total Income, Total Expenses, and Monthly Spending Distributions.
- 📊 **General Dataset Profiler** — Auto-detects metrics, dates, and categories for sales, fitness, leads, or custom spreadsheets.
- 🔒 **100% Data Privacy** — All file parsing, PDF extraction, statistical calculations, and dashboard generation happen strictly inside your browser. No files or financial records are uploaded to any server or third-party service.
- 🎛️ **Drag-and-Drop Grid Layout** — Rearrange, resize, and reorder widgets using `react-grid-layout`.
- ✏️ **Interactive Widget Editor** — Edit data mappings, chart colors, axis titles, and styles via an intuitive side drawer.
- ↺ **Undo / Redo** — Full dashboard edit history with Zustand state management.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand + Immer |
| Charts | Recharts |
| Grid | react-grid-layout |
| Parsing | pdfjs-dist (PDF), PapaParse (CSV), SheetJS/xlsx (Excel) |
| UI Primitives | Radix UI (Tabs, Dialog, Select, Tooltip) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd AI-Dashboard-builder
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Drag and drop any CSV or Excel file (e.g., bank statement or sales log) to instantly see your visual dashboard.

### Production Build

```bash
npm run build
npm run start
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
