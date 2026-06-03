import Script from "next/script";
import type { AnalyticsEventName, AnalyticsProperties } from "@/lib/analytics/events";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalyticsProvider() {
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="velvet-ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}

export function trackGoogleEvent(
  event: AnalyticsEventName,
  properties?: AnalyticsProperties,
) {
  if (typeof window === "undefined" || !GA_ID || !window.gtag) return;
  window.gtag("event", event, properties ?? {});
}

export function trackGooglePageView(url: string, title?: string) {
  trackGoogleEvent("page_view", {
    page_location: url,
    page_title: title ?? document.title,
  });
}
