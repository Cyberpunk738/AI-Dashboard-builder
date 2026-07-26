import { processBankStatement, type BankStatementAnalytics, type ProcessingOptions } from "./engine";

export interface WorkerInputMessage {
  rows: Record<string, unknown>[];
  fileName?: string;
  options?: ProcessingOptions;
}

self.onmessage = (event: MessageEvent<WorkerInputMessage>) => {
  const { rows, fileName, options } = event.data;
  try {
    const result = processBankStatement(rows, fileName, options);
    self.postMessage({ success: true, data: result });
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message });
  }
};
