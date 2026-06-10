import { getAppBaseUrl } from "@/lib/app-url";

const FALLBACK_ORIGIN = "https://the-velvet.netlify.app";

export function getSiteOrigin(): string {
  return (getAppBaseUrl() || FALLBACK_ORIGIN).replace(/\/$/, "");
}

export function generateCanonicalUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteOrigin()}${normalized}`;
}
