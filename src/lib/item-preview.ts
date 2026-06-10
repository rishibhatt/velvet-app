import {
  extractInstagramUsername,
  formatInstagramProfileTitle,
  isInstagramProfileUrl,
} from "@/lib/instagram-profile";
import {
  extractYouTubeVideoId,
  isYouTubeVideoUrl,
  youTubeThumbnailUrl,
} from "@/lib/optimize-image-url";
import type { Item } from "@/types/board.types";

const WEAK_PREVIEW_PATTERNS = [
  /favicon/i,
  /google\.com\/s2\/favicons/i,
  /apple-touch-icon/i,
  /fluidicon/i,
  /brand_assets/i,
  /meta-tag/i,
  /\/logo(?:[./?]|$)/i,
  /\.ico(?:\?|$)/i,
  /\/s\d{2}x\d{2}\//i,
  /avatar.*\d{2,3}x\d{2,3}/i,
  /cdninstagram\.com\/rsrc\.php/i,
  /static\.cdninstagram\.com/i,
  /^data:image\//i,
  /\/rsrc\.php\//i,
];

/** Reject favicons / logos that were mistakenly stored as preview images. */
export function isWeakPreviewImage(url: string | null | undefined): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();
  return WEAK_PREVIEW_PATTERNS.some((pattern) => pattern.test(lower));
}

type PreviewItem = {
  image_url?: string | null;
  source_url?: string | null;
  source?: Item["source"] | null;
};

/** Best preview URL for grids and modals — repairs bad legacy metadata when possible. */
export function getItemPreviewImage(item: PreviewItem): string | null {
  const stored = item.image_url;
  if (stored && !isWeakPreviewImage(stored)) return stored;

  if (item.source === "youtube" && item.source_url && isYouTubeVideoUrl(item.source_url)) {
    const id = extractYouTubeVideoId(item.source_url);
    if (id) return youTubeThumbnailUrl(id);
  }

  return null;
}

export function getItemDisplayTitle(
  item: Pick<Item, "title" | "source_url" | "type" | "source">,
): string {
  const trimmed = item.title?.trim();
  if (trimmed) {
    if (item.source === "instagram" && item.source_url && isInstagramProfileUrl(item.source_url)) {
      const username = extractInstagramUsername(item.source_url);
      if (username) return formatInstagramProfileTitle(trimmed, username);
    }
    return trimmed;
  }
  if (item.type === "note") return "Note";
  if (item.source_url) {
    try {
      return new URL(item.source_url).hostname.replace(/^www\./, "");
    } catch {
      return item.source_url;
    }
  }
  return "Saved link";
}
