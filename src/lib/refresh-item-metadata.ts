import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchBoardPreviewImages } from "@/lib/collection-previews";
import { isWeakPreviewImage } from "@/lib/item-preview";
import { detectSourceFromUrl, resolveLinkMetadata } from "@/lib/link-metadata";
import {
  extractYouTubeVideoId,
  optimizeStoredImageUrl,
  youTubeThumbnailUrl,
} from "@/lib/optimize-image-url";
import type { Item, ItemSource } from "@/types/board.types";
import type { Database } from "@/types/database.types";

type VelvetSupabase = SupabaseClient<Database>;

type RefreshableItem = Pick<
  Item,
  | "id"
  | "board_id"
  | "type"
  | "source"
  | "source_url"
  | "image_url"
  | "title"
  | "description"
>;

export function itemNeedsMetadataRefresh(
  item: RefreshableItem,
  force = false,
): boolean {
  if (item.type === "note") return false;
  if (!item.source_url?.trim()) return false;
  if (item.type === "image" && item.source === "upload") return false;
  if (force) return true;
  if (!item.image_url) return true;
  return isWeakPreviewImage(item.image_url);
}

async function resolvePreviewImageUrl(
  metaImage: string | null,
  source: ItemSource,
  sourceUrl: string,
): Promise<string | null> {
  let imageUrl = metaImage;
  if (imageUrl && isWeakPreviewImage(imageUrl)) imageUrl = null;

  if (!imageUrl && source === "youtube") {
    const id = extractYouTubeVideoId(sourceUrl);
    if (id) imageUrl = youTubeThumbnailUrl(id);
  }

  return imageUrl;
}

export async function refreshItemFromSourceUrl(
  supabase: VelvetSupabase,
  userId: string,
  item: RefreshableItem,
): Promise<{ updated: boolean; error?: string }> {
  const sourceUrl = item.source_url?.trim();
  if (!sourceUrl) return { updated: false, error: "No source URL" };

  try {
    const meta = await resolveLinkMetadata(sourceUrl);
    const source = meta.source ?? detectSourceFromUrl(sourceUrl);
    const imageUrl = await resolvePreviewImageUrl(
      meta.imageUrl,
      source,
      sourceUrl,
    );

    let storedImage: string | null = null;
    if (imageUrl) {
      storedImage = optimizeStoredImageUrl(imageUrl, source);
    }

    const nextTitle =
      meta.title?.trim() &&
      meta.title !== sourceUrl &&
      !meta.title.startsWith("http")
        ? meta.title.trim()
        : item.title;

    const { error } = await supabase
      .from("items")
      .update({
        image_url: storedImage,
        title: nextTitle,
        description: meta.description ?? item.description,
        source,
      })
      .eq("id", item.id)
      .is("deleted_at", null);

    if (error) return { updated: false, error: error.message };
    return { updated: true };
  } catch (err) {
    return {
      updated: false,
      error: err instanceof Error ? err.message : "Refresh failed",
    };
  }
}

export async function refreshBoardItemMetadata(
  supabase: VelvetSupabase,
  userId: string,
  boardId: string,
  options: { force?: boolean; limit?: number } = {},
): Promise<{
  processed: number;
  updated: number;
  skipped: number;
  failed: number;
  remaining: number;
}> {
  const limit = options.limit ?? 12;
  const force = options.force ?? false;

  const { data, error } = await supabase
    .from("items")
    .select("id, board_id, type, source, source_url, image_url, title, description")
    .eq("board_id", boardId)
    .is("deleted_at", null)
    .not("source_url", "is", null)
    .order("created_at", { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? "Could not load items");
  }

  const candidates = data.filter((row) =>
    itemNeedsMetadataRefresh(row as RefreshableItem, force),
  );

  const batch = candidates.slice(0, limit);
  let updated = 0;
  let failed = 0;

  for (const row of batch) {
    const result = await refreshItemFromSourceUrl(
      supabase,
      userId,
      row as RefreshableItem,
    );
    if (result.updated) updated += 1;
    else failed += 1;
  }

  if (updated > 0) {
    const previews = await fetchBoardPreviewImages([boardId], supabase);
    const nextCover = previews[boardId]?.[0] ?? null;
    await supabase.from("boards").update({ cover_url: nextCover }).eq("id", boardId);
  }

  return {
    processed: batch.length,
    updated,
    skipped: data.length - candidates.length,
    failed,
    remaining: Math.max(0, candidates.length - batch.length),
  };
}
