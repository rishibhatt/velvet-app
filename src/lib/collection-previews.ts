import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/services/supabase/client";
import { isSupabaseConfigured } from "@/lib/utils";
import type { Board } from "@/types/board.types";
import type { Database } from "@/types/database.types";

type VelvetSupabase = SupabaseClient<Database>;

const PREVIEW_LIMIT = 4;

/** Latest item image URLs per board (non-deleted items only). */
export async function fetchBoardPreviewImages(
  boardIds: string[],
  supabase?: VelvetSupabase,
): Promise<Record<string, string[]>> {
  if (boardIds.length === 0) return {};

  const client =
    supabase ?? (isSupabaseConfigured() ? createClient() : null);
  if (!client) return {};
  const { data, error } = await client
    .from("items")
    .select("board_id, image_url, created_at")
    .in("board_id", boardIds)
    .is("deleted_at", null)
    .not("image_url", "is", null)
    .order("created_at", { ascending: false });

  if (error || !data) return {};

  const map: Record<string, string[]> = {};
  for (const row of data) {
    const boardId = row.board_id as string;
    const url = row.image_url as string | null;
    if (!url) continue;
    if (!map[boardId]) map[boardId] = [];
    if (map[boardId].length < PREVIEW_LIMIT) {
      map[boardId].push(url);
    }
  }
  return map;
}

/** Poster grid uses live saves only — not stale board.cover_url. */
export function resolveBoardPreviewImages(
  board: { id: string },
  previewsByBoard: Record<string, string[]>,
): string[] {
  return (previewsByBoard[board.id] ?? []).slice(0, PREVIEW_LIMIT);
}

export async function attachBoardPreviews<T extends Board>(
  boards: T[],
  supabase?: VelvetSupabase,
): Promise<T[]> {
  if (boards.length === 0) return boards;
  const previews = await fetchBoardPreviewImages(
    boards.map((b) => b.id),
    supabase,
  );
  return boards.map((board) => ({
    ...board,
    preview_images: resolveBoardPreviewImages(board, previews),
  }));
}

/** After removing a save, align cover_url with the newest remaining image (or clear it). */
export async function syncBoardCoverFromItems(boardId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  const previews = await fetchBoardPreviewImages([boardId]);
  const nextCover = previews[boardId]?.[0] ?? null;

  await supabase.from("boards").update({ cover_url: nextCover }).eq("id", boardId);
}

/** Derive poster URLs from in-memory items (optimistic UI). */
export function previewImagesFromItems(
  items: Array<{ image_url?: string | null; deleted_at?: string | null }>,
): string[] {
  return items
    .filter((i) => !i.deleted_at && i.image_url)
    .map((i) => i.image_url as string)
    .slice(0, PREVIEW_LIMIT);
}

type HeroPreviewFallback = {
  preview_images?: string[] | null;
  cover_url?: string | null;
};

/**
 * Hero poster grid from live saves (1–4 images). When items are loaded, ignores stale cover_url.
 */
export function resolveHeroPreviewImages(
  items: Array<{ image_url?: string | null; deleted_at?: string | null }> | undefined,
  fallback?: HeroPreviewFallback | null,
): string[] {
  if (items !== undefined) {
    return previewImagesFromItems(items);
  }
  const previews = fallback?.preview_images?.filter(Boolean);
  if (previews?.length) return previews.slice(0, PREVIEW_LIMIT);
  if (fallback?.cover_url) return [fallback.cover_url];
  return [];
}

/** @deprecated Use resolveHeroPreviewImages — first image only */
export function resolveHeroCoverUrl(
  items: Array<{ image_url?: string | null; deleted_at?: string | null }> | undefined,
  fallbackCoverUrl?: string | null,
): string | null {
  return resolveHeroPreviewImages(items, { cover_url: fallbackCoverUrl })[0] ?? null;
}
