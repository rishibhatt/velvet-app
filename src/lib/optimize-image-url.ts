import type { ItemSource } from "@/types/board.types";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }
    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/")[2] ?? null;
    }
    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/")[2] ?? null;
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

/** Target width from `sizes` / layout (2× for retina, capped). */
export function resolveImageWidth(
  sizes?: string,
  width?: number | `${number}`,
): number {
  if (typeof width === "number") {
    return Math.min(Math.ceil(width * 2), 1920);
  }

  const pxMatches = sizes?.match(/(\d+)px/g);
  if (pxMatches?.length) {
    const maxPx = Math.max(
      ...pxMatches.map((token) => parseInt(token.replace("px", ""), 10)),
    );
    return Math.min(maxPx * 2, 512);
  }

  if (sizes?.includes("100vw")) return 828;
  if (sizes?.includes("45vw") || sizes?.includes("50vw")) return 400;
  if (sizes?.includes("30vw") || sizes?.includes("33vw")) return 384;
  if (sizes?.includes("22vw")) return 320;

  return 640;
}

export function youTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Downgrade heavy external preview URLs (link saves fallback only). */
export function optimizeExternalImageUrl(
  url: string,
  options: { width?: number; source?: ItemSource | null } = {},
): string {
  if (!url) return url;

  const width = options.width ?? 640;

  if (url.includes("i.ytimg.com") || url.includes("youtube.com")) {
    const id = extractYouTubeVideoId(url) ?? url.match(/\/vi\/([^/]+)\//)?.[1];
    if (id) return youTubeThumbnailUrl(id);
    return url
      .replace(/maxresdefault\.jpg/i, "hqdefault.jpg")
      .replace(/sddefault\.jpg/i, "hqdefault.jpg");
  }

  if (url.includes("googleusercontent.com")) {
    const target = Math.min(Math.max(width * 2, 128), 512);
    if (/=s\d+/i.test(url)) {
      return url.replace(/=s\d+(-[a-z0-9-]+)*/i, `=s${target}-c`);
    }
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}=s${target}-c`;
  }

  if (url.includes("maps.googleapis.com") || url.includes("maps.google.com/maps/api/staticmap")) {
    return url.replace(/size=\d+x\d+/i, "size=400x320");
  }

  return url;
}

/** Fallback when remote ingest fails — lighter external URL in DB. */
export function optimizeStoredImageUrl(
  url: string,
  source?: ItemSource | null,
): string {
  if (!url || isSupabaseStorageUrl(url)) return url;

  if (source === "youtube") {
    const id = extractYouTubeVideoId(url);
    if (id) return youTubeThumbnailUrl(id);
  }

  return optimizeExternalImageUrl(url, {
    width: source === "youtube" ? 480 : 400,
    source,
  });
}

/** Display-time cleanup for external URLs. Supabase URLs are already compressed in storage. */
export function optimizeImageUrlForDisplay(
  url: string,
  options: { width?: number } = {},
): string {
  if (!url || isSupabaseStorageUrl(url)) return url;
  return optimizeExternalImageUrl(url, { width: options.width ?? 640 });
}
