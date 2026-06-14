import { trackClarityEvent } from "@/lib/analytics/clarity";
import { trackGoogleEvent, trackGooglePageView } from "@/lib/analytics/google";
import {
  capturePostHog,
  identifyPostHog,
  initPostHog,
  isFeatureEnabled,
  registerPostHogSuperProperties,
  resetPostHog,
} from "@/lib/analytics/posthog";
import {
  ANALYTICS_EVENTS,
  type AnalyticsEventName,
  type AnalyticsProperties,
  type AnalyticsUser,
  sanitizeProperties,
} from "@/lib/analytics/events";
import { getAttributionProperties } from "@/lib/attribution";

export { ANALYTICS_EVENTS };

export function initAnalytics() {
  initPostHog();
}

export function track(
  event: AnalyticsEventName,
  properties?: AnalyticsProperties,
) {
  if (typeof window === "undefined") return;
  const safe = sanitizeProperties({
    ...getAttributionProperties(),
    ...properties,
  });
  trackGoogleEvent(event, safe);
  capturePostHog(event, safe);
  trackClarityEvent(event, safe);
}

export function trackPageView(url: string, title?: string) {
  trackGooglePageView(url, title);
  capturePostHog(ANALYTICS_EVENTS.PAGE_VIEWED, {
    page_location: url,
    page_title: title ?? document.title,
  });
}

export function identify(user: AnalyticsUser) {
  identifyPostHog(user, getAttributionProperties());
}

export function resetAnalytics() {
  resetPostHog();
}

export function featureFlagEnabled(key: string) {
  return isFeatureEnabled(key);
}

export function trackError(error: unknown, context?: AnalyticsProperties) {
  const message = error instanceof Error ? error.message : "Unknown error";
  track(ANALYTICS_EVENTS.ERROR_TRACKED, {
    error_message: message.slice(0, 200),
    ...context,
  });
}
