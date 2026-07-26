"use client";

import { useCallback } from "react";
import { ShieldCheck, BarChart3, ArrowLeft, Lock } from "lucide-react";
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors border border-neutral-800 bg-[#0a0a0a] px-3.5 py-2 rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </button>
      )}

      <div className="w-full max-w-xl text-center space-y-6">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 text-xs font-mono font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
            100% Client-Side Privacy
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Upload Financial Statement
          </h1>
          <p className="text-xs text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Drag and drop your PDF bank statement, CSV, or Excel file to generate instant institutional analytics.
          </p>
        </div>

        <div className="rounded border border-neutral-800 bg-[#0a0a0a] p-6 shadow-2xl">
          <FileDropzone
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-white" />
            <span>Files are parsed client-side and never stored on any server.</span>
          </div>

          <button
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline underline-offset-4"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Try Sample Bank Statement
          </button>
        </div>
      </div>
    </div>
  );
}
