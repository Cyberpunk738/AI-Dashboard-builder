"use client";

import { useCallback } from "react";
import { useDataStore } from "@/stores/data-store";
import { parseCSV, parseExcel, inferColumnType } from "@/lib/parsing";
import type { Column, ColumnSummary, Dataset } from "@/types/dataset";
import type { UploadResult } from "@/types/upload";

export function useDataset() {
  const store = useDataStore();

  const buildSummary = (
    columns: Column[],
    rows: Record<string, unknown>[]
  ): ColumnSummary[] => {
    return columns.map((col) => {
      const values = rows.map((r) => r[col.name]);
      const nonNull = values.filter((v) => v != null);
      const numericValues = nonNull.filter(
        (v): v is number => typeof v === "number"
      );

      return {
        name: col.name,
        type: col.type,
        distinct: new Set(nonNull.map((v) => String(v))).size,
        nullCount: values.length - nonNull.length,
        min:
          numericValues.length > 0
            ? Math.min(...numericValues)
            : undefined,
        max:
          numericValues.length > 0
            ? Math.max(...numericValues)
            : undefined,
        mean:
          numericValues.length > 0
            ? numericValues.reduce((a, b) => a + b, 0) /
              numericValues.length
            : undefined,
        sampleValues: nonNull.slice(0, 5),
      };
    });
  };

  const loadFile = useCallback(
    async (file: File) => {
      store.setLoading(true);
      store.setError(null);

      try {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const isExcel =
          ext === "xlsx" || ext === "xls" || ext === "xlsm";

        const raw = isExcel
          ? await parseExcel(file)
          : await parseCSV(file);

        const columns: Column[] = raw.columns.map((name) => {
          const values = raw.rows.map((r) => r[name]);
          return {
            name,
            type: inferColumnType(values),
            nullable: values.some((v) => v == null),
          };
        });

        const summary = buildSummary(columns, raw.rows);

        const dataset: Dataset = {
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          fileName: file.name,
          columns,
          rows: raw.rows,
          rowCount: raw.rows.length,
          summary,
          uploadedAt: new Date().toISOString(),
        };

        store.setDataset(dataset);
      } catch (err) {
        store.setError(
          err instanceof Error
            ? err.message
            : "Failed to parse file"
        );
      }
    },
    [store]
  );

  const loadParsedData = useCallback(
    (result: UploadResult) => {
      const columns: Column[] = result.columns.map((col) => ({
        name: col.name,
        type: col.type,
        nullable: col.nullable,
      }));

      const summary: ColumnSummary[] = result.columns.map((col) => ({
        name: col.name,
        type: col.type,
        distinct: col.uniqueCount,
        nullCount: col.nullCount,
        min: col.min,
        max: col.max,
        mean: col.mean,
        sampleValues: col.sampleValues,
      }));

      const dataset: Dataset = {
        id: result.id,
        name: result.fileName.replace(/\.[^/.]+$/, ""),
        fileName: result.fileName,
        columns,
        rows: result.rows,
        rowCount: result.rowCount,
        summary,
        uploadedAt: result.parsedAt,
      };

      store.setDataset(dataset);
    },
    [store]
  );

  const getSampleRows = useCallback(
    (count = 10): Record<string, unknown>[] => {
      return store.dataset?.rows.slice(0, count) ?? [];
    },
    [store.dataset]
  );

  return {
    dataset: store.dataset,
    isLoading: store.isLoading,
    error: store.error,
    loadFile,
    loadParsedData,
    getSampleRows,
    clearDataset: store.clearDataset,
  };
}
