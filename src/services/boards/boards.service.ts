import { BOARD_SELECT, mapBoard } from "@/lib/board-mapper";
import { attachBoardPreviews } from "@/lib/collection-previews";
import { likesService } from "@/services/likes/likes.service";
import { incrementSlug, slugifyTitle } from "@/lib/slug";
import { parseSupabaseError, requireSupabase } from "@/lib/supabase-errors";
import { isSupabaseConfigured } from "@/lib/utils";
import { createClient } from "@/services/supabase/client";
import type {
  Board,
  BoardInvitation,
  BoardMember,
  CreateBoardInput,
  UpdateBoardInput,
} from "@/types/board.types";
import type { Database } from "@/types/database.types";

type BoardUpdate = Database["public"]["Tables"]["boards"]["Update"];

async function resolveOwnerScopedSlug(
  supabase: ReturnType<typeof createClient>,
  ownerId: string,
  title: string,
  excludeBoardId?: string,
): Promise<string> {
  const base = slugifyTitle(title);
  const { data, error } = await supabase
    .from("boards")
    .select("id, slug")
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .like("slug", `${base}%`);

  if (error) throw new Error(parseSupabaseError(error));

  const existing = new Set(
    (data ?? [])
      .filter((row) => row.id !== excludeBoardId)
      .map((row) => row.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );

  for (let index = 1; index < 1000; index += 1) {
    const candidate = incrementSlug(base, index);
    if (!existing.has(candidate)) return candidate;
  }

  throw new Error("Could not generate a unique collection URL.");
}

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
      memberBoards = (data ?? []) as unknown as BoardRow[];
    }

    const merged = [
      ...((owned ?? []) as unknown as BoardRow[]),
      ...memberBoards,
    ];
    const unique = Array.from(
      new Map(merged.map((b) => [b.id, b])).values(),
    );
    const boards = unique.map((row) => mapBoard(row));
    return attachBoardPreviews(boards);
  },

  async getLikedBoards(): Promise<Board[]> {
    if (!isSupabaseConfigured()) return [];
    requireSupabase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: likes, error: likesError } = await supabase
      .from("board_likes")
      .select("board_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (likesError) throw new Error(parseSupabaseError(likesError));

    const boardIds = (likes ?? []).map((r) => r.board_id);
    if (boardIds.length === 0) return [];

    const { data, error } = await supabase
      .from("boards")
      .select(BOARD_SELECT)
      .in("id", boardIds)
      .is("deleted_at", null);

    if (error) throw new Error(parseSupabaseError(error));

    type BoardRow = Parameters<typeof mapBoard>[0];
    const byId = new Map(
      ((data ?? []) as unknown as BoardRow[]).map((row) => [
        row.id,
        mapBoard(row),
      ]),
    );
    const liked = boardIds
      .map((id) => byId.get(id))
      .filter((b): b is Board => Boolean(b))
      .map((board) => ({ ...board, is_liked: true }));
    return attachBoardPreviews(liked);
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
    const board = mapBoard(data as never);
    const liked = await likesService.getLikedBoardIds([board.id]);
    return { ...board, is_liked: liked.has(board.id) };
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
    const board = mapBoard(data as never);
    if (board.is_public) {
      const liked = await likesService.getLikedBoardIds([board.id]);
      return { ...board, is_liked: liked.has(board.id) };
    }
    return board;
  },

  async getBoardMembers(boardId: string): Promise<BoardMember[]> {
    const board = await this.getBoardById(boardId);
    return board?.members ?? [];
  },

  async inviteMember(
    boardId: string,
    username: string,
    role: BoardMember["role"],
  ): Promise<BoardInvitation> {
    requireSupabase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to invite collaborators.");

    const normalized = username.trim().replace(/^@/, "").toLowerCase();
    if (!normalized) throw new Error("Enter a username to invite.");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, banner_url, bio, website, created_at, updated_at")
      .eq("username", normalized)
      .maybeSingle();

    if (profileError) throw new Error(parseSupabaseError(profileError));
    if (!profile) throw new Error(`No user found with username @${normalized}.`);

    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("owner_id")
      .eq("id", boardId)
      .single();
    if (boardError) throw new Error(parseSupabaseError(boardError));

    const boardRow = board as { owner_id: string };
    if (boardRow.owner_id === profile.id) {
      throw new Error("This person already owns the collection.");
    }

    const { data: existing } = await supabase
      .from("board_members")
      .select("id")
      .eq("board_id", boardId)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (existing) {
      throw new Error("They are already a collaborator on this collection.");
    }

    const { data: pending } = await supabase
      .from("board_invitations")
      .select("id")
      .eq("board_id", boardId)
      .eq("invitee_id", profile.id)
      .eq("status", "pending")
      .maybeSingle();
    if (pending) {
      throw new Error("They already have a pending invite for this collection.");
    }

    const { data: invitationId, error: inviteError } = await supabase.rpc(
      "create_board_invitation",
      {
        p_board_id: boardId,
        p_invitee_id: profile.id,
        p_role: role,
      },
    );
    if (inviteError) throw new Error(parseSupabaseError(inviteError));

    const { data: invitation, error: invitationError } = await supabase
      .from("board_invitations")
      .select("*")
      .eq("id", invitationId)
      .single();
    if (invitationError) throw new Error(parseSupabaseError(invitationError));

    return invitation as BoardInvitation;
  },

  async removeMember(boardId: string, memberId: string): Promise<void> {
    requireSupabase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in.");

    const { data: member, error: fetchError } = await supabase
      .from("board_members")
      .select("id, user_id, board_id, profile:profiles(username)")
      .eq("id", memberId)
      .eq("board_id", boardId)
      .maybeSingle();
    if (fetchError) throw new Error(parseSupabaseError(fetchError));
    if (!member) throw new Error("Collaborator not found.");

    const memberRow = member as unknown as {
      user_id: string;
      profile?: { username: string } | null;
    };

    const { data: board } = await supabase
      .from("boards")
      .select("owner_id")
      .eq("id", boardId)
      .single();
    const ownerId = (board as { owner_id: string } | null)?.owner_id;
    if (memberRow.user_id === ownerId) {
      throw new Error("The collection owner cannot be removed.");
    }

    const { error } = await supabase
      .from("board_members")
      .delete()
      .eq("id", memberId)
      .eq("board_id", boardId);
    if (error) throw new Error(parseSupabaseError(error));

    const username = memberRow.profile?.username;
    await supabase.from("activity_logs").insert({
      board_id: boardId,
      user_id: user.id,
      action: username ? `removed @${username} from the collection` : "removed a collaborator",
      entity: "member",
      entity_id: memberId,
    });
  },

  async createBoard(input: CreateBoardInput): Promise<Board> {
    requireSupabase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to create a board.");

    const slug = await resolveOwnerScopedSlug(supabase, user.id, input.title);

    const { data, error } = await supabase
      .from("boards")
      .insert({
        owner_id: user.id,
        title: input.title,
        slug,
        mood: input.mood,
        mood_label: input.moodLabel?.trim() || null,
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
      const { data: boardOwner, error: ownerError } = await supabase
        .from("boards")
        .select("owner_id")
        .eq("id", boardId)
        .single();
      if (ownerError) throw new Error(parseSupabaseError(ownerError));

      patch.title = input.title;
      patch.slug = await resolveOwnerScopedSlug(
        supabase,
        boardOwner.owner_id,
        input.title,
        boardId,
      );
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

    const { error: rpcError } = await supabase.rpc("soft_delete_board", {
      p_board_id: id,
    });

    if (!rpcError) return;

    const rpcMessage = rpcError.message ?? "";
    const rpcMissing =
      rpcMessage.includes("soft_delete_board") ||
      rpcMessage.includes("Could not find the function");

    if (!rpcMissing) {
      throw new Error(parseSupabaseError(rpcError));
    }

    const { error } = await supabase
      .from("boards")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(parseSupabaseError(error));
  },

  async hasAnyBoard(): Promise<boolean> {
    const boards = await this.getBoards();
    return boards.length > 0;
  },
};
