import type { Dataset } from "@/types/dataset";

export type IntegrationProvider =
  | "stripe"
  | "meta_ads"
  | "postgresql"
  | "google_analytics"
  | "custom_api";

export interface IntegrationConfig {
  id: string;
  provider: IntegrationProvider;
  label: string;
  credentials: Record<string, string>;
  options?: Record<string, unknown>;
}

export interface IntegrationAdapter {
  provider: IntegrationProvider;
  label: string;
  connect: (config: IntegrationConfig) => Promise<boolean>;
  fetchData: (config: IntegrationConfig) => Promise<Dataset>;
  disconnect: (config: IntegrationConfig) => Promise<void>;
}

export interface IntegrationState {
  integrations: IntegrationConfig[];
  isConnecting: boolean;
  error: string | null;
}
