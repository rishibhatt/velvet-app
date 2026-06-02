import { createClient } from "@/services/supabase/client";
import { isSupabaseConfigured } from "@/lib/utils";

const PREVIEW_LIMIT = 4;

/** Latest item image URLs per board (for collection poster grids). */
export async function fetchBoardPreviewImages(
  boardIds: string[],
): Promise<Record<string, string[]>> {
  if (!isSupabaseConfigured() || boardIds.length === 0) return {};

  const supabase = createClient();
  const { data, error } = await supabase
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

export function resolveBoardPreviewImages(
  board: { id: string; cover_url?: string | null },
  previewsByBoard: Record<string, string[]>,
): string[] {
  const fromItems = previewsByBoard[board.id] ?? [];
  if (fromItems.length >= PREVIEW_LIMIT) return fromItems.slice(0, PREVIEW_LIMIT);

  const merged = [...fromItems];
  if (board.cover_url && !merged.includes(board.cover_url)) {
    merged.unshift(board.cover_url);
  }
  return merged.slice(0, PREVIEW_LIMIT);
}
