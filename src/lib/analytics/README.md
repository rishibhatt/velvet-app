# Velvet Analytics

## Structure

- `events.ts`: event names, property types, privacy-safe sanitization.
- `google.tsx`: GA4 script loading and page/event forwarding.
- `posthog.ts`: official PostHog SDK init, capture, identify, reset, feature flags.
- `clarity.tsx`: production-only Microsoft Clarity script and custom events.
- `index.ts`: public API: `track`, `identify`, `resetAnalytics`, `trackError`.

## Usage

```ts
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

track(ANALYTICS_EVENTS.COLLECTION_SHARED, {
  collection_id: board.id,
  share_type: "share_sheet",
});
```

Use `TrackOnMount` for server-rendered public pages that need client-side events.

```tsx
<TrackOnMount
  event={ANALYTICS_EVENTS.COLLECTION_VIEWED}
  properties={{ collection_id: board.id, creator_id: board.owner_id }}
/>
```

## Environment

```bash
NEXT_PUBLIC_GA_ID=G-...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_CLARITY_ID=...
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...
```

## Netlify

Add the same variables in Netlify:

Site configuration -> Environment variables -> Add variable.

Redeploy after changing public environment variables. Clarity loads only in production. GA4 and PostHog load lazily after hydration and do not block rendering.

## Privacy

Do not send passwords, tokens, raw secrets, invitation links, or private notes. User identification runs only after authentication and sends `id`, `email`, `username`, and `collection_count`.
