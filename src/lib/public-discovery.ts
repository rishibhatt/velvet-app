import { BOARD_SELECT, mapBoard } from "@/lib/board-mapper";
import { attachBoardPreviews } from "@/lib/collection-previews";
import { createClient } from "@/services/supabase/server";
import type { Board, Mood } from "@/types/board.types";

export async function getPublicBoardsByMood(
  mood: Mood | null,
  excludeBoardId?: string,
  limit = 24,
): Promise<Board[]> {
  if (!mood) return [];
  const supabase = await createClient();
  let request = supabase
    .from("boards")
    .select(`${BOARD_SELECT}, owner:profiles!owner_id(id, username, full_name, avatar_url)`)
    .eq("mood", mood)
    .eq("is_public", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (excludeBoardId) request = request.neq("id", excludeBoardId);
  const { data } = await request;
  const boards = (data ?? []).map((row) => withOwner(row));
  return attachBoardPreviews(boards, supabase);
}

export async function getPublicBoardsByOwner(
  ownerId: string,
  excludeBoardId?: string,
  limit = 12,
): Promise<Board[]> {
  const supabase = await createClient();
  let request = supabase
    .from("boards")
    .select(BOARD_SELECT)
    .eq("owner_id", ownerId)
    .eq("is_public", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (excludeBoardId) request = request.neq("id", excludeBoardId);
  const { data } = await request;
  return attachBoardPreviews((data ?? []).map((row) => mapBoard(row as never)), supabase);
}

export async function getTagPage(slug: string) {
  const supabase = await createClient();
  const normalized = slug.replace(/-/g, " ");
  const { data: tags } = await supabase
    .from("tags")
    .select("board_id, name")
    .ilike("name", normalized);

  const boardIds = [...new Set((tags ?? []).map((tag) => tag.board_id))];
  if (boardIds.length === 0) return { tagName: normalized, boards: [] };

  const { data } = await supabase
    .from("boards")
    .select(`${BOARD_SELECT}, owner:profiles!owner_id(id, username, full_name, avatar_url)`)
    .in("id", boardIds)
    .eq("is_public", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(48);

  return {
    tagName: tags?.[0]?.name ?? normalized,
    boards: await attachBoardPreviews((data ?? []).map((row) => withOwner(row)), supabase),
  };
}

function withOwner(row: unknown): Board {
  const board = mapBoard(row as never);
  return { ...board, owner: (row as { owner?: Board["owner"] }).owner };
}
