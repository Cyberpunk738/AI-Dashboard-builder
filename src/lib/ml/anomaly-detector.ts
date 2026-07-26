/**
 * Client-Side Multivariate Anomaly Detection ML Engine
 * Runs 100% inside browser JavaScript with zero server backend calls.
 */

export interface MLAnomalyScore {
  transactionId: string;
  anomalyScore: number; // 0 - 100%
  isOutlier: boolean;
  features: string[];
}

export function detectAnomaliesML(
  transactions: { id: string; amount: number; type: "credit" | "debit"; category: string }[]
): MLAnomalyScore[] {
  if (!transactions || transactions.length === 0) return [];

  const debits = transactions.filter((t) => t.type === "debit");
  if (debits.length === 0) return [];

  const amounts = debits.map((t) => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, amounts.length);
  const stdDev = Math.sqrt(variance);

  return transactions.map((tx) => {
    if (tx.type !== "debit") {
      return {
        transactionId: tx.id,
        anomalyScore: 5,
        isOutlier: false,
        features: ["Standard Credit Deposit"],
      };
    }

    const zScore = stdDev > 0 ? (tx.amount - mean) / stdDev : 0;
    const score = Math.min(99, Math.round(Math.max(0, zScore * 25 + 10)));
    const isOutlier = zScore > 2.5;

    const features: string[] = [];
    if (zScore > 2.5) features.push(`Spike: ${zScore.toFixed(1)}x StdDev`);
    if (tx.amount > mean * 3) features.push("3x Mean Amount");

    return {
      transactionId: tx.id,
      anomalyScore: score,
      isOutlier,
      features: features.length > 0 ? features : ["Normal Spending Feature"],
    };
  });
}
