/**
 * Browser-Based Hybrid ML Transaction Classifier
 * Combines ML Cosine Vector Similarity with exact pattern recognition.
 * Runs 100% in browser JavaScript with zero server backend calls.
 */

import { computeEmbedding, cosineSimilarity } from "./embeddings";
import type { TransactionCategory } from "../analytics/category-engine";

export interface TransactionMLResult {
  category: TransactionCategory;
  confidenceScore: number; // 0 - 100%
  method: "ml-vector-embedding" | "pattern-rule" | "fallback";
  matchedKeyword?: string;
}

const CATEGORY_VOCABULARY: Record<TransactionCategory, string[]> = {
  Salary: ["salary", "payroll", "wage", "stipend", "direct deposit", "employer", "bonus", "payout", "compensation"],
  Subscription: ["netflix", "spotify", "apple", "google play", "dstv", "showmax", "hbo", "disney", "patreon", "github", "openai", "chatgpt"],
  Groceries: ["shoprite", "tesco", "sainsbury", "asda", "waitrose", "aldi", "lidl", "spar", "supermarket", "groceries", "market"],
  Transport: ["uber", "bolt", "lyft", "tfl", "taxify", "transit", "taxi", "cab", "metro", "bus", "flight"],
  Utilities: ["nnpc", "fuel", "petrol", "electricity", "water", "gas", "utility", "power", "energy", "broadband"],
  Entertainment: ["dstv", "cinema", "movie", "theater", "arcade", "playstation", "xbox", "nintendo", "ticket"],
  Shopping: ["amazon", "ebay", "zara", "asos", "nike", "adidas", "jumia", "konga", "retail", "fashion"],
  Healthcare: ["pharmacy", "boots", "hospital", "clinic", "doctor", "dental", "medplus", "medicine"],
  Restaurants: ["restaurant", "cafe", "coffee", "starbucks", "mcdonald", "kfc", "domino", "pizza", "bistro", "bukka"],
  Bills: ["bill", "insurance", "loan", "mortgage", "rent", "lease", "tax", "fee", "charge"],
  ATM: ["atm", "cash withdrawal", "cash dispense", "cashpoint"],
  POS: ["pos", "pos purchase", "pos debit", "card purchase", "terminal"],
  "Cash Withdrawal": ["cash withdrawal", "cash out", "over the counter cash"],
  Investment: ["vanguard", "fidelity", "robinhood", "trading", "investment", "cowrywise", "piggyvest", "bamboo"],
  Loan: ["repayment", "loan pay", "lender", "klarna", "fairmoney", "carbon", "renmoney"],
  Insurance: ["insurance", "assurance", "aviva", "allianz", "policy", "premium"],
  Education: ["university", "college", "school", "tuition", "course", "udemy", "coursera"],
  Travel: ["hotel", "airbnb", "booking.com", "expedia", "flight", "resort", "airline"],
  Transfer: ["transfer", "mobile transfer", "wire", "p2p", "revolut", "zelle", "venmo", "monzo", "wise", "nip"],
  Other: ["miscellaneous", "general", "other"],
};

// Flatten vocabulary for vector representation
const ALL_VOCABULARY_TERMS = Array.from(
  new Set(Object.values(CATEGORY_VOCABULARY).flat())
);

export function classifyTransactionML(rawDescription: string): TransactionMLResult {
  if (!rawDescription) {
    return { category: "Other", confidenceScore: 50, method: "fallback" };
  }

  const clean = rawDescription.toLowerCase();

  // 1. Direct Pattern Rule Check (High Confidence)
  if (clean.includes("shoprite")) return { category: "Groceries", confidenceScore: 99.4, method: "pattern-rule", matchedKeyword: "shoprite" };
  if (clean.includes("uber")) return { category: "Transport", confidenceScore: 99.2, method: "pattern-rule", matchedKeyword: "uber" };
  if (clean.includes("bolt")) return { category: "Transport", confidenceScore: 99.1, method: "pattern-rule", matchedKeyword: "bolt text" };
  if (clean.includes("netflix")) return { category: "Subscription", confidenceScore: 99.5, method: "pattern-rule", matchedKeyword: "netflix" };
  if (clean.includes("dstv")) return { category: "Entertainment", confidenceScore: 98.9, method: "pattern-rule", matchedKeyword: "dstv" };
  if (clean.includes("nnpc")) return { category: "Utilities", confidenceScore: 98.7, method: "pattern-rule", matchedKeyword: "nnpc" };
  if (clean.includes("salary") || clean.includes("payroll")) return { category: "Salary", confidenceScore: 99.8, method: "pattern-rule", matchedKeyword: "salary" };
  if (clean.includes("atm")) return { category: "ATM", confidenceScore: 98.5, method: "pattern-rule", matchedKeyword: "atm" };
  if (clean.includes("mobile transfer") || clean.includes("transfer")) return { category: "Transfer", confidenceScore: 97.5, method: "pattern-rule", matchedKeyword: "transfer" };

  // 2. Vector Embedding + Cosine Similarity Classification
  const inputVector = computeEmbedding(clean, ALL_VOCABULARY_TERMS);

  let bestCategory: TransactionCategory = "Other";
  let maxSim = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_VOCABULARY)) {
    const category = cat as TransactionCategory;
    const catVector = computeEmbedding(keywords.join(" "), ALL_VOCABULARY_TERMS);
    const sim = cosineSimilarity(inputVector, catVector);

    if (sim > maxSim) {
      maxSim = sim;
      bestCategory = category;
    }
  }

  if (maxSim > 0.05) {
    const confidenceScore = Math.min(96, Math.round(70 + maxSim * 55));
    return {
      category: bestCategory,
      confidenceScore,
      method: "ml-vector-embedding",
    };
  }

  return { category: "Other", confidenceScore: 60, method: "fallback" };
}
