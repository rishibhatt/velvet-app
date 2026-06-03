import posthog from "posthog-js";
import type {
  AnalyticsEventName,
  AnalyticsProperties,
  AnalyticsUser,
} from "@/lib/analytics/events";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;

export function initPostHog() {
  if (typeof window === "undefined" || initialized || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    autocapture: false,
    loaded: () => {
      initialized = true;
    },
  });
}

export function capturePostHog(
  event: AnalyticsEventName,
  properties?: AnalyticsProperties,
) {
  if (!initialized) initPostHog();
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function identifyPostHog(user: AnalyticsUser) {
  if (!initialized) initPostHog();
  if (!POSTHOG_KEY) return;
  posthog.identify(user.id, {
    email: user.email ?? undefined,
    username: user.username ?? undefined,
    collection_count: user.collection_count,
  });
}

export function resetPostHog() {
  if (!POSTHOG_KEY || !initialized) return;
  posthog.reset();
}

export function isFeatureEnabled(key: string) {
  if (!POSTHOG_KEY || !initialized) return false;
  return Boolean(posthog.isFeatureEnabled(key));
}
