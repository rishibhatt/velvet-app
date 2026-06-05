import Script from "next/script";
import type { AnalyticsEventName, AnalyticsProperties } from "@/lib/analytics/events";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export function ClarityProvider() {
  if (!CLARITY_ID || process.env.NODE_ENV !== "production") return null;
  return (
    <Script id="velvet-clarity" strategy="lazyOnload">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `}
    </Script>
  );
}

export function trackClarityEvent(
  event: AnalyticsEventName,
  properties?: AnalyticsProperties,
) {
  if (typeof window === "undefined" || !window.clarity) return;
  window.clarity("event", event);
  if (properties) {
    Object.entries(properties).forEach(([key, value]) => {
      if (value != null) window.clarity?.("set", key, String(value));
    });
  }
}
