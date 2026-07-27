"use client";

import { useCallback } from "react";
import { ShieldCheck, BarChart3, ArrowLeft, Lock, Star } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { useDataset } from "@/hooks/useDataset";
import { useDataStore } from "@/stores/data-store";
import { getSampleDataset } from "@/lib/analytics/sample-data";
import type { UploadResult } from "@/types/upload";

interface UploadPanelProps {
  onBackToLanding?: () => void;
}

export function UploadPanel({ onBackToLanding }: UploadPanelProps) {
  const { dataset, loadParsedData } = useDataset();
  const setDataset = useDataStore((s) => s.setDataset);

  const handleUploadComplete = useCallback(
    (result: UploadResult) => {
      loadParsedData(result);
    },
    [loadParsedData]
  );

  const handleUploadError = useCallback((uploadError: { message: string }) => {
    console.error("Upload failed:", uploadError.message);
  }, []);

  const handleLoadSample = () => {
    setDataset(getSampleDataset());
  };

  if (dataset) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-black selection:text-white">
      {/* Brand Header / Back button */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBackToLanding}>
          <Star className="w-5 h-5 fill-black text-black" />
          <span className="text-lg font-semibold tracking-tight text-black">
            Vanguard AI Platform
          </span>
          <span className="text-[10px] font-mono font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200 hidden sm:inline-block">
            STELLAR ENGINE
          </span>
        </div>

        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-black transition-colors border border-gray-200 bg-gray-50 px-4 py-2 rounded-full shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        )}
      </div>

      <div className="w-full max-w-xl text-center space-y-6 pt-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200 text-xs font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            100% In-Browser Local Privacy
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            Upload Bank Statement
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            Drag and drop your PDF bank statement, CSV, or Excel file for instant AI processing, health scores, and ledger audits.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <FileDropzone
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-gray-500 font-sans">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-gray-700" />
            <span>Files are parsed client-side and never saved to any cloud server.</span>
          </div>

          <button
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-black hover:underline underline-offset-4"
          >
            <BarChart3 className="h-4 w-4" />
            Try Sample Demo Dataset
          </button>
        </div>
      </div>
    </div>
  );
}
