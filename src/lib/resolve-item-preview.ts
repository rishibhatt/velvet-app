import { isWeakPreviewImage } from "@/lib/item-preview";
import {
  extractYouTubeVideoId,
  isYouTubeVideoUrl,
  youTubeThumbnailUrl,
} from "@/lib/optimize-image-url";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";
import { fetchUrlMetadata } from "@/services/metadata/metadata.service";
import type { ItemSource } from "@/types/board.types";

/** Platform-specific preview from the link itself — never a stale stored blob. */
export function previewImageFromSourceUrl(
  sourceUrl: string | null | undefined,
  source: ItemSource | null | undefined,
): string | null {
  if (!sourceUrl?.trim()) return null;

  if (source === "youtube" && isYouTubeVideoUrl(sourceUrl)) {
    const id = extractYouTubeVideoId(sourceUrl);
    if (id) return youTubeThumbnailUrl(id);
  }

  return null;
}

/**
 * Authoritative preview URL at save time.
 * Prefers source_url-derived images, then fresh metadata — never a Supabase URL from UI state.
 */
export async function resolvePreviewImageForSave(
  sourceUrl: string | null | undefined,
  source: ItemSource | null | undefined,
  clientImageUrl?: string | null,
): Promise<string | null> {
  const fromSource = previewImageFromSourceUrl(sourceUrl, source);
  if (fromSource) return fromSource;

  if (sourceUrl?.trim()) {
    try {
      const meta = await fetchUrlMetadata(sourceUrl.trim());
      if (meta.imageUrl && !isWeakPreviewImage(meta.imageUrl)) {
        return meta.imageUrl;
      }
    } catch {
      /* fall through */
    }
  }

  if (
    clientImageUrl &&
    !isSupabaseStorageUrl(clientImageUrl) &&
    !isWeakPreviewImage(clientImageUrl)
  ) {
    return clientImageUrl;
  }

  return null;
}
