import type { Metadata } from "next";
import { BRAND } from "@/constants/brand";

const defaultDescription =
  "Collaborative moodboards for weddings, travel, fashion, home, events, and life planning.";

const PRODUCTION_URL = "https://the-velvet.netlify.app";

function getMetadataBase(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv);
    } catch {
      /* fall through */
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL(PRODUCTION_URL);
}

/** Shared metadata for layout and marketing pages */
export function createSiteMetadata(overrides?: Metadata): Metadata {
  const title = `${BRAND.name} — ${BRAND.tagline}`;
  const ogImage = {
    url: BRAND.logo.og,
    width: 1200,
    height: 630,
    alt: BRAND.name,
    type: "image/jpeg" as const,
  };

  const base: Metadata = {
    metadataBase: getMetadataBase(),
    title: {
      default: title,
      template: `%s — ${BRAND.name}`,
    },
    description: defaultDescription,
    applicationName: BRAND.name,
    authors: [{ name: BRAND.name }],
    creator: BRAND.name,
    icons: {
      icon: [
        { url: BRAND.logo.icon32, sizes: "32x32", type: "image/png" },
        { url: BRAND.logo.icon192, sizes: "192x192", type: "image/png" },
      ],
      apple: [
        { url: BRAND.logo.apple180, sizes: "180x180", type: "image/png" },
      ],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: BRAND.name,
      title,
      description: defaultDescription,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: defaultDescription,
      images: [BRAND.logo.og],
    },
    appleWebApp: {
      capable: true,
      title: BRAND.name,
      statusBarStyle: "default",
    },
  };

  if (!overrides) return base;
  return { ...base, ...overrides };
}
