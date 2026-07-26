/**
 * Client-Side ML Time-Series Forecaster (Linear Regression & Trend Forecast)
 * Runs 100% inside browser JavaScript with zero server backend calls.
 */

export interface ForecastPoint {
  date: string;
  projectedBalance: number;
  lowerBound: number;
  upperBound: number;
}

export interface MLForecastResult {
  rSquared: number; // 0.0 - 1.0 (Model goodness of fit)
  dailySlope: number; // Projected balance change per day
  projectedBalance30Days: number; // Balance prediction at T+30 days
  trendDirection: "upward" | "downward" | "flat";
  confidenceRating: number; // 0 - 100%
  forecastPoints: ForecastPoint[];
}

export function forecastBalanceML(
  timeSeries: { date: string; runningBalance: number }[]
): MLForecastResult {
  if (!timeSeries || timeSeries.length < 3) {
    return {
      rSquared: 0,
      dailySlope: 0,
      projectedBalance30Days: 0,
      trendDirection: "flat",
      confidenceRating: 50,
      forecastPoints: [],
    };
  }

  const n = timeSeries.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = timeSeries[i].runningBalance;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  // Linear Regression: y = slope * x + intercept
  const slopeNumerator = n * sumXY - sumX * sumY;
  const slopeDenominator = n * sumX2 - sumX * sumX;
  const slope = slopeDenominator !== 0 ? slopeNumerator / slopeDenominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Compute R^2 (Coefficient of Determination)
  const rNumerator = n * sumXY - sumX * sumY;
  const rDenominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );
  const r = rDenominator !== 0 ? rNumerator / rDenominator : 0;
  const rSquared = Math.max(0, Math.min(1, r * r));

  const lastDateStr = timeSeries[n - 1].date;
  const lastDate = new Date(lastDateStr);

  const forecastPoints: ForecastPoint[] = [];
  const stdError = Math.sqrt(Math.max(0, (sumY2 - intercept * sumY - slope * sumXY) / Math.max(1, n - 2)));

  for (let step = 1; step <= 30; step++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + step);
    const dateStr = nextDate.toISOString().split("T")[0];

    const projected = Math.round((slope * (n - 1 + step) + intercept) * 100) / 100;
    const margin = stdError * 1.96 * Math.sqrt(1 + 1 / n + (step * step) / Math.max(1, sumX2));

    forecastPoints.push({
      date: dateStr,
      projectedBalance: Math.max(0, projected),
      lowerBound: Math.max(0, projected - margin),
      upperBound: projected + margin,
    });
  }

  const projected30 = forecastPoints[29]?.projectedBalance ?? timeSeries[n - 1].runningBalance;
  const confidenceRating = Math.round(Math.min(95, Math.max(50, rSquared * 100)));

  return {
    rSquared: Math.round(rSquared * 100) / 100,
    dailySlope: Math.round(slope * 100) / 100,
    projectedBalance30Days: projected30,
    trendDirection: slope > 50 ? "upward" : slope < -50 ? "downward" : "flat",
    confidenceRating,
    forecastPoints,
  };
}
