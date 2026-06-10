/** Compact view count for cards (round down at 1k/1M). */
export function formatViewCount(n: number): string {
  if (n <= 0) return "";
  if (n >= 1_000_000) {
    const v = Math.floor((n / 1_000_000) * 10) / 10;
    return `${v}M`;
  }
  if (n >= 1_000) {
    const v = Math.floor((n / 1_000) * 10) / 10;
    return `${v}k`;
  }
  return String(n);
}
