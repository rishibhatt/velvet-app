import { hasAttributionParams, parseAttributionFromSearchParams } from "@/lib/attribution/parse";
import { getAttribution, setAttribution } from "@/lib/attribution/storage";
import type { AttributionSnapshot } from "@/lib/attribution/types";

export function captureAttributionFromSearchParams(
  params: URLSearchParams | { toString(): string; get(name: string): string | null },
): AttributionSnapshot | null {
  const parsed = parseAttributionFromSearchParams(params);
  if (!hasAttributionParams(parsed)) return getAttribution();

  return setAttribution(parsed);
}

export function captureAttributionFromLocation(): AttributionSnapshot | null {
  if (typeof window === "undefined") return null;
  return captureAttributionFromSearchParams(new URLSearchParams(window.location.search));
}
