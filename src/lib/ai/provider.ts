// ============================================================
// LLM Provider abstraction — DeepSeek & Gemini
// Both expose OpenAI-compatible chat completion endpoints.
// ============================================================

export type AIProvider = "deepseek" | "gemini";

// ── Provider metadata ──

interface ProviderMeta {
  baseUrl: string;
  defaultModel: string;
  envKey: string;
  modelEnvKey: string;
}

export const PROVIDERS: Record<AIProvider, ProviderMeta> = {
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1/chat/completions",
    defaultModel: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
    modelEnvKey: "DEEPSEEK_AI_MODEL",
  },
  gemini: {
    baseUrl:
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    defaultModel: "gemini-2.0-flash",
    envKey: "GEMINI_API_KEY",
    modelEnvKey: "GEMINI_AI_MODEL",
  },
};

// ── Resolve provider from env ──

export function getActiveProvider(): {
  provider: AIProvider;
  apiKey: string;
  model: string;
} {
  const provider =
    (process.env.AI_PROVIDER as AIProvider | undefined) ?? "deepseek";
  const meta = PROVIDERS[provider];
  const apiKey = process.env[meta.envKey] ?? "";
  const model =
    process.env[meta.modelEnvKey] ??
    process.env.AI_MODEL ??
    meta.defaultModel;

  return { provider, apiKey, model };
}

// ── Build request headers ──

export function buildHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

// ── Build the endpoint URL ──

export function getBaseUrl(provider: AIProvider): string {
  return PROVIDERS[provider].baseUrl;
}

// ─── Helper: throw on missing key ───

export function requireApiKey(
  provider: AIProvider,
  apiKey: string
): asserts apiKey is string {
  if (!apiKey) {
    const meta = PROVIDERS[provider];
    throw new Error(
      `${meta.envKey} not configured. Add it to .env.local or set AI_PROVIDER to switch providers.`
    );
  }
}
