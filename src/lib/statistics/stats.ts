export interface StatisticalSummary {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  sum: number;
  stdDev: number;
  variance: number;
  p25: number;
  p75: number;
  iqr: number;
  outliers: number[];
}

export function calculateStats(values: number[]): StatisticalSummary {
  const cleanValues = values.filter((v) => typeof v === "number" && !isNaN(v));
  
  if (cleanValues.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      sum: 0,
      stdDev: 0,
      variance: 0,
      p25: 0,
      p75: 0,
      iqr: 0,
      outliers: [],
    };
  }

  const sorted = [...cleanValues].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  const min = sorted[0];
  const max = sorted[count - 1];

  const median = getPercentile(sorted, 0.5);
  const p25 = getPercentile(sorted, 0.25);
  const p75 = getPercentile(sorted, 0.75);
  const iqr = p75 - p25;

  const lowerBound = p25 - 1.5 * iqr;
  const upperBound = p75 + 1.5 * iqr;
  const outliers = sorted.filter((val) => val < lowerBound || val > upperBound);

  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    count,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min,
    max,
    sum: Math.round(sum * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    p25: Math.round(p25 * 100) / 100,
    p75: Math.round(p75 * 100) / 100,
    iqr: Math.round(iqr * 100) / 100,
    outliers,
  };
}

function getPercentile(sorted: number[], percentile: number): number {
  const index = (sorted.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sorted.length) return sorted[sorted.length - 1];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}
