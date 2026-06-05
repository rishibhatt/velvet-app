import type {
  AnalyticsEventName,
  AnalyticsProperties,
  AnalyticsUser,
} from "@/lib/analytics/events";
import type { PostHog, PostHogInterface } from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;
let initPromise: Promise<void> | null = null;
let posthogInstance: PostHogInterface | null = null;

async function getPostHogSdk(): Promise<PostHog | null> {
  if (!POSTHOG_KEY || typeof window === "undefined") return null;
  const mod = await import("posthog-js");
  return mod.default;
}

export function initPostHog() {
  if (typeof window === "undefined" || initialized || !POSTHOG_KEY) return;
  if (initPromise) return;

  initPromise = (async () => {
    const posthog = await getPostHogSdk();
    if (!posthog || initialized) return;

    posthog.init(POSTHOG_KEY!, {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
      autocapture: false,
      disable_session_recording: true,
      disable_surveys: true,
      persistence: "localStorage+cookie",
      loaded: (client: PostHogInterface) => {
        posthogInstance = client;
        initialized = true;
      },
    });
  })();
}

async function withPostHog(fn: (posthog: PostHogInterface) => void): Promise<void> {
  if (!POSTHOG_KEY) return;
  if (!initialized) initPostHog();
  if (initPromise) await initPromise;
  if (!posthogInstance || !initialized) return;
  fn(posthogInstance);
}

export function capturePostHog(
  event: AnalyticsEventName,
  properties?: AnalyticsProperties,
) {
  void withPostHog((posthog) => posthog.capture(event, properties));
}

export function identifyPostHog(user: AnalyticsUser) {
  void withPostHog((posthog) =>
    posthog.identify(user.id, {
      email: user.email ?? undefined,
      username: user.username ?? undefined,
      collection_count: user.collection_count,
    }),
  );
}

export function resetPostHog() {
  if (!POSTHOG_KEY || !initialized || !posthogInstance) return;
  posthogInstance.reset();
  initialized = false;
  posthogInstance = null;
  initPromise = null;
}

export function isFeatureEnabled(key: string) {
  if (!POSTHOG_KEY || !initialized || !posthogInstance) return false;
  return Boolean(posthogInstance.isFeatureEnabled(key));
}
