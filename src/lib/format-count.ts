/** Compact display for platform stats (e.g. 1240 → "1.2K", 42 → "42"). */
export function formatPlatformCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m >= 10 ? `${Math.round(m)}M` : `${m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 10_000) {
    const k = Math.round(n / 1000);
    return `${k}K`;
  }
  if (n >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(n);
}
