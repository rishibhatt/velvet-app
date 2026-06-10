import { BOARD_LIST_SELECT, mapBoard } from "@/lib/board-mapper";
import {
  fetchBoardPreviewImages,
  resolveBoardPreviewImages,
} from "@/lib/collection-previews";
import { likesService } from "@/services/likes/likes.service";
import { parseSupabaseError, requireSupabase } from "@/lib/supabase-errors";
import { isSupabaseConfigured } from "@/lib/utils";
import { createClient } from "@/services/supabase/client";
import type { Board, Mood, Profile } from "@/types/board.types";

export type PublicBoardSort =
  | "trending"
  | "new"
  | "most_items"
  | "most_liked"
  | "most_viewed";

export interface PublicBoard extends Board {
  owner?: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
}

export interface DiscoverFilters {
  mood?: Mood | null;
  sort?: PublicBoardSort;
  limit?: number;
  excludeOwnerId?: string;
  query?: string;
}

const PUBLIC_BOARD_SELECT = `
  ${BOARD_LIST_SELECT},
  owner:profiles!owner_id(id, username, full_name, avatar_url)
`;

type PublicBoardRow = Parameters<typeof mapBoard>[0] & {
  owner?: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
};

function mapPublicBoard(
  row: PublicBoardRow,
  likedIds: Set<string>,
): PublicBoard {
  const board = mapBoard(row);
  return {
    ...board,
    owner: row.owner ?? undefined,
    is_liked: likedIds.has(board.id),
  };
}

function sanitizeIlike(term: string): string {
  return term.replace(/[%_\\]/g, "").trim();
}

function sortBoards(boards: PublicBoard[], sort: PublicBoardSort): PublicBoard[] {
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
  if (sort === "most_liked") {
    return copy.sort((a, b) => {
      const likesA = a.like_count ?? 0;
      const likesB = b.like_count ?? 0;
      if (likesB !== likesA) return likesB - likesA;
      return (b.item_count ?? 0) - (a.item_count ?? 0);
    });
  }
  if (sort === "most_viewed") {
    return copy.sort((a, b) => {
      const viewsA = a.view_count ?? 0;
      const viewsB = b.view_count ?? 0;
      if (viewsB !== viewsA) return viewsB - viewsA;
      return (b.trending_score ?? 0) - (a.trending_score ?? 0);
    });
  }
  return copy.sort((a, b) => {
    const trendA = a.trending_score ?? 0;
    const trendB = b.trending_score ?? 0;
    if (trendB !== trendA) return trendB - trendA;
    const likesA = a.like_count ?? 0;
    const likesB = b.like_count ?? 0;
    if (likesB !== likesA) return likesB - likesA;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export const discoverService = {
  async getPublicBoards(filters: DiscoverFilters = {}): Promise<PublicBoard[]> {
    if (!isSupabaseConfigured()) return [];
    requireSupabase();

    const {
      mood = null,
      sort = "trending",
      limit = 48,
      excludeOwnerId,
      query,
    } = filters;

    const supabase = createClient();
    const fetchLimit = sort === "new" ? limit : Math.min(limit * 3, 150);

    let request = supabase
      .from("boards")
      .select(PUBLIC_BOARD_SELECT)
      .eq("is_public", true)
      .is("deleted_at", null);

    if (mood) {
      request = request.eq("mood", mood);
    }

    if (excludeOwnerId) {
      request = request.neq("owner_id", excludeOwnerId);
    }

    const normalizedQuery = query ? sanitizeIlike(query).toLowerCase() : "";
    if (normalizedQuery) {
      const pattern = `%${normalizedQuery}%`;
      request = request.or(
        `title.ilike.${pattern},description.ilike.${pattern},mood.ilike.${pattern}`,
      );
    }

    if (sort === "new") {
      request = request.order("created_at", { ascending: false }).limit(fetchLimit);
    } else if (sort === "trending") {
      request = request
        .order("trending_score", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(fetchLimit);
    } else if (sort === "most_viewed") {
      request = request
        .order("view_count", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(fetchLimit);
    } else {
      request = request.order("updated_at", { ascending: false }).limit(fetchLimit);
    }

    const { data, error } = await request;

    if (error) throw new Error(parseSupabaseError(error));

    const rows = (data ?? []) as unknown as PublicBoardRow[];
    const boardIds = rows.map((r) => r.id);
    const likedIds = await likesService.getLikedBoardIds(boardIds);

    const previewsByBoard = await fetchBoardPreviewImages(boardIds);
    let mapped = rows.map((row) => {
      const board = mapPublicBoard(row, likedIds);
      return {
        ...board,
        preview_images: resolveBoardPreviewImages(board, previewsByBoard),
      };
    });

    if (normalizedQuery) {
      mapped = mapped.filter((b) => {
        const inOwner = (b.owner?.username ?? "")
          .toLowerCase()
          .includes(normalizedQuery);
        return (
          b.title.toLowerCase().includes(normalizedQuery) ||
          (b.description ?? "").toLowerCase().includes(normalizedQuery) ||
          (b.mood ?? "").toLowerCase().includes(normalizedQuery) ||
          inOwner
        );
      });
    }

    return sortBoards(mapped, sort).slice(0, limit);
  },

  async searchProfiles(
    query: string,
    limit = 20,
  ): Promise<
    Pick<Profile, "id" | "username" | "full_name" | "avatar_url" | "bio">[]
  > {
    if (!isSupabaseConfigured()) return [];
    requireSupabase();

    const term = sanitizeIlike(query);
    if (!term) return [];

    const supabase = createClient();
    const pattern = `%${term}%`;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, bio")
      .or(`username.ilike.${pattern},full_name.ilike.${pattern}`)
      .order("username", { ascending: true })
      .limit(limit);

    if (error) throw new Error(parseSupabaseError(error));
    return data ?? [];
  },
};
