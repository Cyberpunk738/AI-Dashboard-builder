import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Column, ColumnSummary, Dataset } from "@/types/dataset";

interface DataState {
  dataset: Dataset | null;
  isLoading: boolean;
  error: string | null;

  setDataset: (dataset: Dataset) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearDataset: () => void;
}

export const useDataStore = create<DataState>()(
  immer((set) => ({
    dataset: null,
    isLoading: false,
    error: null,

    setDataset: (dataset) =>
      set((state) => {
        state.dataset = dataset;
        state.error = null;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
        state.isLoading = false;
      }),

    clearDataset: () =>
      set((state) => {
        state.dataset = null;
        state.error = null;
      }),
  }))
);

export const selectColumns = (state: DataState): Column[] =>
  state.dataset?.columns ?? [];

export const selectSummary = (state: DataState): ColumnSummary[] =>
  state.dataset?.summary ?? [];

export const selectSampleRows = (
  state: DataState,
  count = 10
): Record<string, unknown>[] =>
  state.dataset?.rows.slice(0, count) ?? [];
