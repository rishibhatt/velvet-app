import { ATTRIBUTION_STORAGE_KEY } from "@/lib/attribution/constants";
import type { AttributionSnapshot, UtmParams } from "@/lib/attribution/types";

function canUseSessionStorage(): boolean {
  return typeof sessionStorage !== "undefined";
}

export function getAttribution(): AttributionSnapshot | null {
  if (!canUseSessionStorage()) return null;
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AttributionSnapshot;
  } catch {
    return null;
  }
}

export function setAttribution(params: UtmParams): AttributionSnapshot {
  const snapshot: AttributionSnapshot = {
    ...params,
    captured_at: new Date().toISOString(),
  };
  if (canUseSessionStorage()) {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(snapshot));
  }
  return snapshot;
}

export function clearAttribution(): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
}
