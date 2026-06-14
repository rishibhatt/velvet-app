import { getAttribution } from "@/lib/attribution/storage";
import type { AnalyticsProperties } from "@/lib/analytics/events";

export function getAttributionProperties(): AnalyticsProperties {
  const snapshot = getAttribution();
  if (!snapshot) return {};

  const { captured_at: _capturedAt, ...utm } = snapshot;
  return utm;
}
