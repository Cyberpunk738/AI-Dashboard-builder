export interface CurrencyConfig {
  symbol: string;
  code: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { symbol: "₦", code: "NGN", locale: "en-NG" },
  { symbol: "£", code: "GBP", locale: "en-GB" },
  { symbol: "€", code: "EUR", locale: "de-DE" },
  { symbol: "$", code: "USD", locale: "en-US" },
  { symbol: "C$", code: "CAD", locale: "en-CA" },
  { symbol: "A$", code: "AUD", locale: "en-AU" },
  { symbol: "₹", code: "INR", locale: "en-IN" },
  { symbol: "R", code: "ZAR", locale: "en-ZA" },
  { symbol: "GH₵", code: "GHS", locale: "en-GH" },
  { symbol: "KSh", code: "KES", locale: "en-KE" },
  { symbol: "AED", code: "AED", locale: "ar-AE" },
  { symbol: "¥", code: "JPY", locale: "ja-JP" },
];

const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[3]; // USD fallback

const BANK_CURRENCY_MAP: Record<string, CurrencyConfig> = {
  // Nigerian Banks & Fintechs -> NGN
  gtbank: SUPPORTED_CURRENCIES[0],
  guaranty: SUPPORTED_CURRENCIES[0],
  zenith: SUPPORTED_CURRENCIES[0],
  access: SUPPORTED_CURRENCIES[0],
  kuda: SUPPORTED_CURRENCIES[0],
  opay: SUPPORTED_CURRENCIES[0],
  palmpay: SUPPORTED_CURRENCIES[0],
  moniepoint: SUPPORTED_CURRENCIES[0],
  firstbank: SUPPORTED_CURRENCIES[0],
  uba: SUPPORTED_CURRENCIES[0],
  stanbic: SUPPORTED_CURRENCIES[0],
  fcmb: SUPPORTED_CURRENCIES[0],
  wema: SUPPORTED_CURRENCIES[0],
  sterling: SUPPORTED_CURRENCIES[0],
  providus: SUPPORTED_CURRENCIES[0],
  vanguard: SUPPORTED_CURRENCIES[0],
  naira: SUPPORTED_CURRENCIES[0],
  ngn: SUPPORTED_CURRENCIES[0],

  // UK Banks -> GBP
  barclays: SUPPORTED_CURRENCIES[1],
  hsbc: SUPPORTED_CURRENCIES[1],
  natwest: SUPPORTED_CURRENCIES[1],
  lloyds: SUPPORTED_CURRENCIES[1],
  starling: SUPPORTED_CURRENCIES[1],
  pound: SUPPORTED_CURRENCIES[1],
  sterling_uk: SUPPORTED_CURRENCIES[1],
  gbp: SUPPORTED_CURRENCIES[1],

  // European Banks -> EUR
  deutsche: SUPPORTED_CURRENCIES[2],
  bnp: SUPPORTED_CURRENCIES[2],
  ing: SUPPORTED_CURRENCIES[2],
  eur: SUPPORTED_CURRENCIES[2],
  euro: SUPPORTED_CURRENCIES[2],

  // US Banks -> USD
  chase: SUPPORTED_CURRENCIES[3],
  bofa: SUPPORTED_CURRENCIES[3],
  "bank of america": SUPPORTED_CURRENCIES[3],
  wells: SUPPORTED_CURRENCIES[3],
  citi: SUPPORTED_CURRENCIES[3],
  usd: SUPPORTED_CURRENCIES[3],
};

export function detectDocumentCurrency(
  rows: Record<string, unknown>[],
  fileName = ""
): CurrencyConfig {
  const fullSampleText = (
    fileName +
    " " +
    rows
      .slice(0, 50)
      .map((r) => Object.values(r).join(" "))
      .join(" ")
  ).toLowerCase();

  // 1. Explicit Symbol Frequency Match (High Priority)
  if (fullSampleText.includes("₦") || fullSampleText.includes("ngn") || fullSampleText.includes("naira")) {
    return SUPPORTED_CURRENCIES[0]; // NGN
  }
  if (fullSampleText.includes("£") || fullSampleText.includes("gbp")) {
    return SUPPORTED_CURRENCIES[1]; // GBP
  }
  if (fullSampleText.includes("€") || fullSampleText.includes("eur")) {
    return SUPPORTED_CURRENCIES[2]; // EUR
  }
  if (fullSampleText.includes("₹") || fullSampleText.includes("inr")) {
    return SUPPORTED_CURRENCIES[6]; // INR
  }
  if (fullSampleText.includes("gh₵") || fullSampleText.includes("ghs")) {
    return SUPPORTED_CURRENCIES[8]; // GHS
  }
  if (fullSampleText.includes("ksh") || fullSampleText.includes("kes")) {
    return SUPPORTED_CURRENCIES[9]; // KES
  }

  // 2. Bank Brand Keyword Match
  for (const [kw, config] of Object.entries(BANK_CURRENCY_MAP)) {
    if (fullSampleText.includes(kw)) {
      return config;
    }
  }

  // 3. Check for USD symbol $
  if (fullSampleText.includes("$") || fullSampleText.includes("usd")) {
    return SUPPORTED_CURRENCIES[3]; // USD
  }

  return DEFAULT_CURRENCY;
}

export function formatCurrency(
  amount: number,
  currency: CurrencyConfig = DEFAULT_CURRENCY,
  options?: { compact?: boolean; hideSymbol?: boolean }
): string {
  const val = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (options?.compact) {
    if (val >= 1_000_000_000) {
      return `${sign}${currency.symbol}${(val / 1_000_000_000).toFixed(1)}B`;
    }
    if (val >= 1_000_000) {
      return `${sign}${currency.symbol}${(val / 1_000_000).toFixed(1)}M`;
    }
    if (val >= 1_000) {
      return `${sign}${currency.symbol}${(val / 1_000).toFixed(1)}K`;
    }
  }

  const formattedNum = val.toLocaleString(currency.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (options?.hideSymbol) {
    return `${sign}${formattedNum}`;
  }

  return `${sign}${currency.symbol}${formattedNum}`;
}
