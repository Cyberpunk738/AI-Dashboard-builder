import { classifyTransactionML } from "../ml/transaction-classifier";

export type TransactionCategory =
  | "Salary"
  | "Transfer"
  | "Groceries"
  | "Transport"
  | "Utilities"
  | "Entertainment"
  | "Shopping"
  | "Healthcare"
  | "Restaurants"
  | "Bills"
  | "ATM"
  | "POS"
  | "Cash Withdrawal"
  | "Investment"
  | "Loan"
  | "Insurance"
  | "Subscription"
  | "Education"
  | "Travel"
  | "Other";

interface CategoryRule {
  category: TransactionCategory;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "Salary",
    keywords: [
      "salary", "payroll", "wage", "stipend", "direct deposit", "employer", "compensation", "remuneration", "paye", "net pay", "earnings", "paycheck"
    ],
  },
  {
    category: "Subscription",
    keywords: [
      "netflix", "spotify", "apple.com", "google play", "amazon prime", "hbo", "disney", "youtube", "patreon", "github", "openai", "chatgpt", "medium", "slack", "zoom", "dropbox", "icloud", "adobe", "subscription", "sub", "dstv", "gotv", "showmax", "starlink"
    ],
  },
  {
    category: "Groceries",
    keywords: [
      "shoprite", "tesco", "sainsbury", "asda", "waitrose", "aldi", "lidl", "walmart", "target", "kroger", "whole foods", "trader joe", "food market", "supermarket", "groceries", "bakery", "provisions", "m&s food", "co-op food", "spar", "game", "hubmart", "justrite", "market", "mart"
    ],
  },
  {
    category: "Restaurants",
    keywords: [
      "restaurant", "cafe", "coffee", "bistro", "diner", "eatery", "starbucks", "mcdonald", "burger king", "kfc", "domino", "pizza", "subway", "nando", "costa", "pret", "deliveroo", "just eat", "ubereats", "uber eats", "bolt food", "chicken republic", "bukka hut", "the place", "sweet sensation", "kFC", "foodie"
    ],
  },
  {
    category: "Transport",
    keywords: [
      "uber", "bolt", "lyft", "tfl", "underground", "train", "rail", "transit", "taxi", "cab", "metro", "bus", "fuel", "nnpc", "petrol", "chevron", "shell", "total", "mobil", "conoil", "oando", "gasoline", "parking", "toll", "indrive", "taxify"
    ],
  },
  {
    category: "Utilities",
    keywords: [
      "nnpc", "fuel", "petrol", "electricity", "water", "gas", "utility", "power", "energy", "broadband", "telecom", "ikedc", "ekedc", "aedc", "ibedc", "phcn", "airtime", "data", "mtn", "airtel", "glo", "9mobile", "recharge", "spectranet", "smile"
    ],
  },
  {
    category: "Shopping",
    keywords: [
      "amazon", "ebay", "zara", "asos", "nike", "adidas", "sephora", "best buy", "electronics", "mall", "boutique", "currys", "john lewis", "argos", "jumia", "konga", "aliexpress", "shein", "store", "retail", "fashion"
    ],
  },
  {
    category: "Entertainment",
    keywords: [
      "cinema", "movie", "theater", "ticket", "concert", "bowling", "event", "gaming", "steam", "playstation", "xbox", "nintendo", "amusement", "casino", "vue", "odeon", "dstv", "gotv"
    ],
  },
  {
    category: "Healthcare",
    keywords: [
      "health", "hospital", "clinic", "doctor", "dental", "dentist", "pharmacy", "boots", "walgreens", "cvs", "medicine", "medical", "optician", "medplus", "healthplus"
    ],
  },
  {
    category: "ATM",
    keywords: [
      "atm", "cash withdrawal", "cash withdraw", "cash dispense", "cash machine", "teller machine"
    ],
  },
  {
    category: "Cash Withdrawal",
    keywords: ["cash", "withdrawal", "withdraw", "over the counter cash"],
  },
  {
    category: "POS",
    keywords: ["pos", "point of sale", "card purchase", "contactless", "terminal"],
  },
  {
    category: "Transfer",
    keywords: [
      "transfer", "trf", "wire", "faster payment", "p2p", "venmo", "zelle", "paypal", "revolut", "wise", "remittance", "internal transfer", "kuda", "moniepoint", "opay", "palmpay", "flutterwave", "paystack", "interswitch", "nip", "fctr"
    ],
  },
  {
    category: "Investment",
    keywords: [
      "investment", "invest", "stocks", "shares", "crypto", "binance", "coinbase", "trading", "robinhood", "etoro", "vanguard", "fidelity", "mutual fund", "cowrywise", "piggyvest", "bamboo"
    ],
  },
  {
    category: "Loan",
    keywords: [
      "loan", "mortgage", "lending", "credit card payment", "repayment", "debt", "interest charge", "klarna", "fairmoney", "carbon", "renmoney"
    ],
  },
  {
    category: "Insurance",
    keywords: [
      "insurance", "policy", "premium", "assurance", "car insurance", "health insurance", "life insurance", "aviva", "allianz", "geico"
    ],
  },
  {
    category: "Education",
    keywords: [
      "university", "college", "school", "tuition", "course", "udemy", "coursera", "education", "training", "books"
    ],
  },
  {
    category: "Travel",
    keywords: [
      "airline", "flight", "hotel", "airbnb", "booking.com", "expedia", "resort", "cruise", "hostel", "travel", "british airways", "peace air"
    ],
  },
];

export function categorizeTransaction(
  description: string,
  isCredit = false
): TransactionCategory {
  if (!description || typeof description !== "string") {
    return isCredit ? "Salary" : "Other";
  }

  const lower = description.toLowerCase().trim();

  // 1. Direct Pattern Rule Matches
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return rule.category;
      }
    }
  }

  // 2. Hybrid ML Classification Prediction
  const mlPrediction = classifyTransactionML(description);
  if (mlPrediction.category !== "Other" && mlPrediction.confidenceScore > 65) {
    return mlPrediction.category;
  }

  if (isCredit) {
    if (lower.includes("pay") || lower.includes("credit") || lower.includes("deposit")) {
      return "Salary";
    }
    return "Transfer";
  }

  return "Other";
}

/**
 * Normalizes raw noisy bank statement merchant strings
 */
export function normalizeMerchantName(description: string): string {
  if (!description) return "Unknown Merchant";

  let clean = description.trim();

  // Strip common bank prefixes
  clean = clean.replace(/^(DIRECT DEBIT -|STANDING ORDER -|CARD PAYMENT TO|FASTER PAYMENT TO|POS PURCHASE|POS|DD|BPAY|WEB PAYMENT|FLUTTERWAVE|PAYSTACK|INTERSWITCH|TRANSFER FROM|TRANSFER TO)\s*/i, "");

  // Strip store numbers and branch trailing digits
  clean = clean.replace(/\s+(STORES|LOC|BRANCH|STORE|NO|#)?\s*\d+\b/gi, "");

  const lower = clean.toLowerCase();
  if (lower.includes("shoprite")) return "Shoprite";
  if (lower.includes("tesco")) return "Tesco";
  if (lower.includes("sainsbury")) return "Sainsbury's";
  if (lower.includes("asda")) return "Asda";
  if (lower.includes("waitrose")) return "Waitrose";
  if (lower.includes("aldi")) return "Aldi";
  if (lower.includes("lidl")) return "Lidl";
  if (lower.includes("tfl") || lower.includes("transport for london")) return "TfL Transport";
  if (lower.includes("uber eats")) return "Uber Eats";
  if (lower.includes("uber")) return "Uber";
  if (lower.includes("bolt")) return "Bolt";
  if (lower.includes("starbucks")) return "Starbucks";
  if (lower.includes("mcdonald")) return "McDonald's";
  if (lower.includes("kfc")) return "KFC";
  if (lower.includes("domino")) return "Domino's Pizza";
  if (lower.includes("chicken republic")) return "Chicken Republic";
  if (lower.includes("nnpc")) return "NNPC Fuel";
  if (lower.includes("shell")) return "Shell Fuel";
  if (lower.includes("total")) return "Total Fuel";
  if (lower.includes("amazon")) return "Amazon";
  if (lower.includes("netflix")) return "Netflix";
  if (lower.includes("spotify")) return "Spotify";
  if (lower.includes("dstv")) return "DStv";

  return clean.length > 28 ? clean.substring(0, 28) + "..." : clean;
}

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Salary: "#ffffff",
  Transfer: "#e5e5e5",
  Groceries: "#d4d4d4",
  Transport: "#a3a3a3",
  Utilities: "#8b5cf6",
  Entertainment: "#ec4899",
  Shopping: "#3b82f6",
  Healthcare: "#ef4444",
  Restaurants: "#f97316",
  Bills: "#737373",
  ATM: "#525252",
  POS: "#404040",
  "Cash Withdrawal": "#737373",
  Investment: "#e5e5e5",
  Loan: "#dc2626",
  Insurance: "#a3a3a3",
  Subscription: "#d4d4d4",
  Education: "#38bdf8",
  Travel: "#eab308",
  Other: "#262626",
};
