import type { Board, BoardMember, Profile } from "@/types/board.types";

interface SupabaseBoardRow {
  id: string;
  owner_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  cover_url: string | null;
  mood: string | null;
  mood_label?: string | null;
  is_public: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  items?: { count: number }[];
  board_likes?: { count: number }[];
  board_members?: Array<{
    id: string;
    board_id: string;
    user_id: string;
    role: string;
    created_at: string;
    profile: Profile | null;
  }>;
}

export function mapBoard(row: SupabaseBoardRow): Board {
  const itemCount = row.items?.[0]?.count ?? 0;
  const likeCount = row.board_likes?.[0]?.count ?? 0;
  const members: BoardMember[] = (row.board_members ?? []).map((bm) => ({
    id: bm.id,
    board_id: bm.board_id,
    user_id: bm.user_id,
    role: bm.role as BoardMember["role"],
    created_at: bm.created_at,
    profile: bm.profile ?? undefined,
  }));

  return {
    id: row.id,
    owner_id: row.owner_id,
    title: row.title,
    slug: row.slug ?? null,
    description: row.description,
    cover_url: row.cover_url,
    mood: row.mood as Board["mood"],
    mood_label: row.mood_label ?? null,
    is_public: row.is_public,
    deleted_at: row.deleted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    item_count: itemCount,
    like_count: likeCount,
    members,
  };
}

export const BOARD_SELECT = `
  *,
  items(count),
  board_likes(count),
  board_members(
    id,
    board_id,
    user_id,
    role,
    created_at,
    profile:profiles(id, username, full_name, avatar_url, banner_url, bio, website, created_at, updated_at)
  )
`;

/** Lighter select for list views (explore, home cards). */
export const BOARD_LIST_SELECT = `
  *,
  items(count),
  board_likes(count)
`;
