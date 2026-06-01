import { BOARD_SELECT, mapBoard } from "@/lib/board-mapper";
import { slugifyTitle, uniqueSlug } from "@/lib/slug";
import { parseSupabaseError, requireSupabase } from "@/lib/supabase-errors";
import { isSupabaseConfigured } from "@/lib/utils";
import { createClient } from "@/services/supabase/client";
import type {
  Board,
  BoardMember,
  CreateBoardInput,
  UpdateBoardInput,
} from "@/types/board.types";
import type { Database } from "@/types/database.types";

type BoardUpdate = Database["public"]["Tables"]["boards"]["Update"];

export const boardsService = {
  async getBoards(): Promise<Board[]> {
    if (!isSupabaseConfigured()) return [];
    requireSupabase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: memberRows } = await supabase
      .from("board_members")
      .select("board_id")
      .eq("user_id", user.id);

    const memberBoardIds = (memberRows ?? []).map((r) => r.board_id);
    const ownedQuery = supabase
      .from("boards")
      .select(BOARD_SELECT)
      .is("deleted_at", null)
      .eq("owner_id", user.id);

    const { data: owned, error: ownedError } = await ownedQuery.order(
      "created_at",
      { ascending: false },
    );
    if (ownedError) throw new Error(parseSupabaseError(ownedError));

    type BoardRow = Parameters<typeof mapBoard>[0];
    let memberBoards: BoardRow[] = [];
    if (memberBoardIds.length > 0) {
      const { data, error } = await supabase
        .from("boards")
        .select(BOARD_SELECT)
        .is("deleted_at", null)
        .in("id", memberBoardIds)
        .neq("owner_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(parseSupabaseError(error));
      memberBoards = (data ?? []) as BoardRow[];
    }

    const merged = [...((owned ?? []) as BoardRow[]), ...memberBoards];
    const unique = Array.from(
      new Map(merged.map((b) => [b.id, b])).values(),
    );
    return unique.map((row) => mapBoard(row));
  },

  async getBoardBySlug(slug: string): Promise<Board | null> {
    if (!isSupabaseConfigured()) return null;
    requireSupabase();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("boards")
      .select(BOARD_SELECT)
      .eq("slug", slug)
      .eq("is_public", true)
      .is("deleted_at", null)
      .single();
    if (error) return null;
    return mapBoard(data as never);
  },

  async getBoardById(id: string): Promise<Board | null> {
    if (!isSupabaseConfigured()) return null;
    requireSupabase();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("boards")
      .select(BOARD_SELECT)
      .eq("id", id)
      .is("deleted_at", null)
      .single();
    if (error) return null;
    return mapBoard(data as never);
  },

  async getBoardMembers(boardId: string): Promise<BoardMember[]> {
    const board = await this.getBoardById(boardId);
    return board?.members ?? [];
  },

  async createBoard(input: CreateBoardInput): Promise<Board> {
    requireSupabase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to create a board.");

    const baseSlug = slugifyTitle(input.title);
    const slug = uniqueSlug(baseSlug, crypto.randomUUID());

    const { data, error } = await supabase
      .from("boards")
      .insert({
        owner_id: user.id,
        title: input.title,
        slug,
        mood: input.mood,
        is_public: input.isPublic,
        description: input.description ?? null,
      })
      .select("*")
      .single();

    if (error) throw new Error(parseSupabaseError(error));

    const boardRow = data as Parameters<typeof mapBoard>[0];

    const { error: memberError } = await supabase.from("board_members").insert({
      board_id: boardRow.id,
      user_id: user.id,
      role: "admin",
    });
    if (memberError) throw new Error(parseSupabaseError(memberError));

    await supabase.from("activity_logs").insert({
      board_id: boardRow.id,
      user_id: user.id,
      action: "created the board",
      entity: "board",
      entity_id: boardRow.id,
    });

    const refreshed = await this.getBoardById(boardRow.id);
    return refreshed ?? mapBoard({ ...boardRow, items: [], board_members: [] });
  },

  async updateBoard(boardId: string, input: UpdateBoardInput): Promise<Board> {
    requireSupabase();
    const supabase = createClient();
    const patch: BoardUpdate = {};
    if (input.title !== undefined) {
      patch.title = input.title;
      patch.slug = uniqueSlug(slugifyTitle(input.title), boardId);
    }
    if (input.description !== undefined) patch.description = input.description;
    if (input.isPublic !== undefined) patch.is_public = input.isPublic;
    if (input.coverUrl !== undefined) patch.cover_url = input.coverUrl;
    if (input.mood !== undefined) patch.mood = input.mood;

    const { error } = await supabase
      .from("boards")
      .update(patch)
      .eq("id", boardId);
    if (error) throw new Error(parseSupabaseError(error));

    const refreshed = await this.getBoardById(boardId);
    if (!refreshed) throw new Error("Board not found after update.");
    return refreshed;
  },

  async updateBoardCover(boardId: string, coverUrl: string) {
    requireSupabase();
    const supabase = createClient();
    const { error } = await supabase
      .from("boards")
      .update({ cover_url: coverUrl })
      .eq("id", boardId);
    if (error) throw error;
  },

  async deleteBoard(id: string) {
    requireSupabase();
    const supabase = createClient();
    const { error } = await supabase
      .from("boards")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async hasAnyBoard(): Promise<boolean> {
    const boards = await this.getBoards();
    return boards.length > 0;
  },
};
