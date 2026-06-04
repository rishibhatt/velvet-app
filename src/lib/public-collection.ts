import { attachBoardPreviews } from "@/lib/collection-previews";
import { BOARD_SELECT, mapBoard } from "@/lib/board-mapper";
import { createClient } from "@/services/supabase/server";
import { getPublicBoardsByMood, getPublicBoardsByOwner } from "@/lib/public-discovery";
import type { Board, Item, Profile, Tag } from "@/types/board.types";

const ITEM_SELECT = `
  *,
  item_tags(tag:tags(id, board_id, name, color, created_at))
`;

function mapItem(row: Record<string, unknown>) {
  const itemTags = (row.item_tags as Array<{ tag: unknown }>) ?? [];
  const { item_tags: _tags, ...rest } = row;
  return {
    ...(rest as unknown as Item),
    tags: itemTags.map((it) => it.tag).filter(Boolean) as Item["tags"],
  };
}

export async function getPublicCollectionBySlug(slug: string): Promise<{
  board: Board;
  items: Item[];
  owner: { username: string; full_name: string | null; avatar_url: string | null } | null;
} | null> {
  const supabase = await createClient();
  const { data: boardRow, error } = await supabase
    .from("boards")
    .select(BOARD_SELECT)
    .eq("slug", slug)
    .eq("is_public", true)
    .is("deleted_at", null)
    .single();

  if (error || !boardRow) return null;

  const board = mapBoard(boardRow as never);

  const { data: itemsData } = await supabase
    .from("items")
    .select(ITEM_SELECT)
    .eq("board_id", board.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { data: owner } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", board.owner_id)
    .single();

  return {
    board,
    items: (itemsData ?? []).map((row) =>
      mapItem(row as Record<string, unknown>),
    ),
    owner: owner ?? null,
  };
}

export async function getPublicCollectionByOwnerSlug(
  username: string,
  slug: string,
): Promise<{
  board: Board;
  items: Item[];
  owner: Pick<Profile, "username" | "full_name" | "avatar_url"> | null;
  tags: Tag[];
  moreFromCreator: Board[];
  relatedCollections: Board[];
} | null> {
  const supabase = await createClient();
  const { data: owner } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("username", username)
    .single();

  if (!owner) return null;

  const { data: boardRow, error } = await supabase
    .from("boards")
    .select(BOARD_SELECT)
    .eq("owner_id", owner.id)
    .eq("slug", slug)
    .eq("is_public", true)
    .is("deleted_at", null)
    .single();

  if (error || !boardRow) return null;

  let board = mapBoard(boardRow as never);
  const { data: itemsData } = await supabase
    .from("items")
    .select(ITEM_SELECT)
    .eq("board_id", board.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { data: tagsData } = await supabase
    .from("tags")
    .select("*")
    .eq("board_id", board.id)
    .order("name", { ascending: true });

  const items = (itemsData ?? []).map((row) =>
    mapItem(row as Record<string, unknown>),
  );

  const [withPreviews] = await attachBoardPreviews([board], supabase);
  board = withPreviews ?? board;

  const more = await getPublicBoardsByOwner(owner.id, board.id, 6);
  const related = await getPublicBoardsByMood(board.mood, board.id, 8);

  return {
    board,
    items,
    owner,
    tags: tagsData ?? [],
    moreFromCreator: more,
    relatedCollections: related,
  };
}

export async function getPublicProfile(username: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, banner_url, bio, website, created_at, updated_at")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data: boards } = await supabase
    .from("boards")
    .select(BOARD_SELECT)
    .eq("owner_id", profile.id)
    .eq("is_public", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const mapped = (boards ?? []).map((row) => mapBoard(row as never));
  const boardsWithPreviews = await attachBoardPreviews(mapped, supabase);

  return {
    profile,
    boards: boardsWithPreviews,
  };
}

export { getPublicBoardsByMood, getTagPage } from "@/lib/public-discovery";
