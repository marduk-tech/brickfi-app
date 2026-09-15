export function getPercentile(sorted: number[], pct: number): number {
  const idx = (pct / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function median(values: number[]): number {
  if (!values.length) return 0;
  return getPercentile(
    [...values].sort((a, b) => a - b),
    50,
  );
}
