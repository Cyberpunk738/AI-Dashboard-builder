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

  const getPercentile = (p: number): number => {
    const index = (p / 100) * (count - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    if (lower === upper) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const median = getPercentile(50);
  const p25 = getPercentile(25);
  const p75 = getPercentile(75);
  const iqr = p75 - p25;

  const variance =
    sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  // Outlier detection using 1.5 * IQR rule
  const lowerBound = p25 - 1.5 * iqr;
  const upperBound = p75 + 1.5 * iqr;
  const outliers = sorted.filter((v) => v < lowerBound || v > upperBound);

  return {
    count,
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    sum: Number(sum.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    variance: Number(variance.toFixed(2)),
    p25: Number(p25.toFixed(2)),
    p75: Number(p75.toFixed(2)),
    iqr: Number(iqr.toFixed(2)),
    outliers,
  };
}

export interface MovingAveragePoint {
  date: string;
  value: number;
  movingAvg: number;
}

export function calculateMovingAverage(
  series: Array<{ date: string; value: number }>,
  windowSize = 7
): MovingAveragePoint[] {
  if (series.length === 0) return [];

  return series.map((item, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const windowItems = series.slice(start, index + 1);
    const avg =
      windowItems.reduce((acc, curr) => acc + curr.value, 0) / windowItems.length;

    return {
      date: item.date,
      value: item.value,
      movingAvg: Number(avg.toFixed(2)),
    };
  });
}
