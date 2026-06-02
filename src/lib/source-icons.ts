import { BRAND } from "@/constants/brand";
import type { ItemSource } from "@/types/board.types";

const BRAND_FAVICON_DOMAIN: Record<ItemSource, string> = {
  instagram: "instagram.com",
  youtube: "youtube.com",
  amazon: "amazon.com",
  pinterest: "pinterest.com",
  web: "",
  upload: "",
};

export function isGoogleMapsUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace(/^www\./, "");
    return (
      (host.includes("google.") && pathname.includes("/maps")) ||
      host === "maps.app.goo.gl" ||
      host === "goo.gl" && pathname.startsWith("/maps")
    );
  } catch {
    return false;
  }
}

/** Favicon / brand icon URL for source chips */
export function getSourceIconUrl(
  source: ItemSource | null,
  pageUrl?: string | null,
): string {
  if (source === "upload") {
    return BRAND.logo.nav40;
  }

  if (pageUrl && (source === "web" || !source)) {
    if (isGoogleMapsUrl(pageUrl)) {
      return "https://www.google.com/s2/favicons?domain=google.com&sz=64";
    }
    try {
      const host = new URL(pageUrl).hostname.replace(/^www\./, "");
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
    } catch {
      /* fall through */
    }
  }

  const key = source ?? "web";
  const domain = BRAND_FAVICON_DOMAIN[key];
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  }

  if (pageUrl) {
    try {
      const host = new URL(pageUrl).hostname.replace(/^www\./, "");
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
    } catch {
      return BRAND.logo.nav40;
    }
  }

  return BRAND.logo.nav40;
}
