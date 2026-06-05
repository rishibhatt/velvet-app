import { BOARD_LIST_SELECT, mapBoard } from "@/lib/board-mapper";
import {
  attachBoardPreviews,
  fetchBoardPreviewImages,
  resolveBoardPreviewImages,
} from "@/lib/collection-previews";
import { createClient } from "@/services/supabase/server";
import type { PublicBoard, DiscoverFilters } from "@/services/discover/discover.service";
import type { Profile } from "@/types/board.types";
import { isSupabaseConfigured } from "@/lib/utils";

const PUBLIC_BOARD_SELECT = `
  ${BOARD_LIST_SELECT},
  owner:profiles!owner_id(id, username, full_name, avatar_url)
`;

type PublicBoardRow = Parameters<typeof mapBoard>[0] & {
  owner?: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
};

/** Server-side public boards for explore SSR (default filters only). */
export async function getExploreBoardsServer(
  filters: Pick<DiscoverFilters, "mood" | "sort" | "limit" | "excludeOwnerId"> = {},
): Promise<PublicBoard[]> {
  if (!isSupabaseConfigured()) return [];

  const {
    mood = null,
    sort = "trending",
    limit = 48,
    excludeOwnerId,
  } = filters;

  const supabase = await createClient();
  const fetchLimit = sort === "new" ? limit : Math.min(limit * 3, 150);

  let request = supabase
    .from("boards")
    .select(PUBLIC_BOARD_SELECT)
    .eq("is_public", true)
    .is("deleted_at", null);

  if (mood) request = request.eq("mood", mood);
  if (excludeOwnerId) request = request.neq("owner_id", excludeOwnerId);

  if (sort === "new") {
    request = request.order("created_at", { ascending: false }).limit(fetchLimit);
  } else {
    request = request.order("updated_at", { ascending: false }).limit(fetchLimit);
  }

  const { data, error } = await request;
  if (error || !data) return [];

  const rows = data as unknown as PublicBoardRow[];
  const boardIds = rows.map((r) => r.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let likedIds = new Set<string>();
  if (user && boardIds.length > 0) {
    const { data: likes } = await supabase
      .from("board_likes")
      .select("board_id")
      .eq("user_id", user.id)
      .in("board_id", boardIds);
    likedIds = new Set((likes ?? []).map((r) => r.board_id));
  }

  const previewsByBoard = await fetchBoardPreviewImages(boardIds, supabase);

  const mapped = rows.map((row) => {
    const board = mapBoard(row);
    const publicBoard: PublicBoard = {
      ...board,
      owner: row.owner ?? undefined,
      is_liked: likedIds.has(board.id),
      preview_images: resolveBoardPreviewImages(board, previewsByBoard),
    };
    return publicBoard;
  });

  const sorted = sortPublicBoards(mapped, sort);
  const withPreviews = await attachBoardPreviews(sorted, supabase);
  return withPreviews.slice(0, limit) as PublicBoard[];
}

function sortPublicBoards(
  boards: PublicBoard[],
  sort: NonNullable<DiscoverFilters["sort"]>,
): PublicBoard[] {
  const copy = [...boards];
  if (sort === "new") {
    return copy.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  if (sort === "most_items") {
    return copy.sort((a, b) => {
      const itemsA = a.item_count ?? 0;
      const itemsB = b.item_count ?? 0;
      if (itemsB !== itemsA) return itemsB - itemsA;
      return (b.like_count ?? 0) - (a.like_count ?? 0);
    });
  }
  return copy.sort((a, b) => {
    const likesA = a.like_count ?? 0;
    const likesB = b.like_count ?? 0;
    if (likesB !== likesA) return likesB - likesA;
    const itemsA = a.item_count ?? 0;
    const itemsB = b.item_count ?? 0;
    if (itemsB !== itemsA) return itemsB - itemsA;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}
