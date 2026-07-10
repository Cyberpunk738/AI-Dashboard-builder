"use client";

import { useCallback } from "react";
import { FileDropzone } from "./FileDropzone";
import { useDataset } from "@/hooks/useDataset";
import type { UploadResult } from "@/types/upload";

export function UploadPanel() {
  const { dataset, error, loadParsedData } = useDataset();

  const handleUploadComplete = useCallback(
    (result: UploadResult) => {
      loadParsedData(result);
    },
    [loadParsedData]
  );

  const handleUploadError = useCallback(
    (uploadError: { message: string }) => {
      console.error("Upload failed:", uploadError.message);
    },
    []
  );

  if (dataset) return null;

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            AI Dashboard Builder
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Upload a CSV or Excel file to generate a smart dashboard
            in seconds
          </p>
        </div>

        <FileDropzone
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Your data stays in your browser. No server uploads.</p>
        </div>
      </div>
    </div>
  );
}
