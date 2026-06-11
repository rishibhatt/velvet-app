import { logDeployDebug } from "@/lib/deploy-debug";
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
 * Prefers source_url-derived images, then the preview the user already saw — never a stale Supabase blob.
 */
export async function resolvePreviewImageForSave(
  sourceUrl: string | null | undefined,
  source: ItemSource | null | undefined,
  clientImageUrl?: string | null,
): Promise<string | null> {
  const fromSource = previewImageFromSourceUrl(sourceUrl, source);
  if (fromSource) {
    // #region agent log
    logDeployDebug({
      runId: "netlify-pre-fix",
      hypothesisId: "A,B",
      location: "resolve-item-preview.ts:resolvePreviewImageForSave",
      message: "resolved from source url",
      data: { sourceUrl, source, fromSource, clientImageUrl },
    });
    // #endregion
    return fromSource;
  }

  if (
    clientImageUrl &&
    !isSupabaseStorageUrl(clientImageUrl) &&
    !isWeakPreviewImage(clientImageUrl)
  ) {
    // #region agent log
    logDeployDebug({
      runId: "netlify-pre-fix",
      hypothesisId: "A,B",
      location: "resolve-item-preview.ts:resolvePreviewImageForSave",
      message: "resolved from client preview url",
      data: { sourceUrl, source, clientImageUrl },
    });
    // #endregion
    return clientImageUrl;
  }

  let metaImageUrl: string | null = null;
  if (sourceUrl?.trim()) {
    try {
      const meta = await fetchUrlMetadata(sourceUrl.trim());
      metaImageUrl = meta.imageUrl;
      if (meta.imageUrl && !isWeakPreviewImage(meta.imageUrl)) {
        // #region agent log
        logDeployDebug({
          runId: "netlify-pre-fix",
          hypothesisId: "B",
          location: "resolve-item-preview.ts:resolvePreviewImageForSave",
          message: "resolved from metadata fallback",
          data: { sourceUrl, source, clientImageUrl, metaImageUrl: meta.imageUrl },
        });
        // #endregion
        return meta.imageUrl;
      }
    } catch {
      /* fall through */
    }
  }

  // #region agent log
  logDeployDebug({
    runId: "netlify-pre-fix",
    hypothesisId: "B",
    location: "resolve-item-preview.ts:resolvePreviewImageForSave",
    message: "no preview resolved",
    data: { sourceUrl, source, clientImageUrl, metaImageUrl },
  });
  // #endregion
  return null;
}
