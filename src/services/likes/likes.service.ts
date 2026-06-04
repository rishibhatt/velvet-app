import { parseSupabaseError, requireSupabase } from "@/lib/supabase-errors";
import { isSupabaseConfigured } from "@/lib/utils";
import { createClient } from "@/services/supabase/client";

type ToggleBoardLikeResult = {
  liked: boolean;
  likeCount: number;
};

function parseToggleResult(data: unknown): ToggleBoardLikeResult {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid like response.");
  }
  const row = data as { liked?: boolean; likeCount?: number };
  if (typeof row.liked !== "boolean" || typeof row.likeCount !== "number") {
    throw new Error("Invalid like response.");
  }
  return { liked: row.liked, likeCount: row.likeCount };
}

export const likesService = {
  async getLikedBoardIds(boardIds: string[]): Promise<Set<string>> {
    if (!isSupabaseConfigured() || boardIds.length === 0) return new Set();
    requireSupabase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Set();

    const { data, error } = await supabase
      .from("board_likes")
      .select("board_id")
      .eq("user_id", user.id)
      .in("board_id", boardIds);

    if (error) throw new Error(parseSupabaseError(error));
    return new Set((data ?? []).map((r) => r.board_id));
  },

  async toggleBoardLike(
    boardId: string,
  ): Promise<ToggleBoardLikeResult> {
    requireSupabase();
    const supabase = createClient();

    const { data, error } = await supabase.rpc("toggle_board_like", {
      p_board_id: boardId,
    });

    if (error) {
      const message = parseSupabaseError(error);
      if (message.includes("toggle_board_like")) {
        return this.toggleBoardLikeLegacy(boardId);
      }
      throw new Error(message);
    }

    return parseToggleResult(data);
  },

  /** Fallback when migration 019 has not been applied yet. */
  async toggleBoardLikeLegacy(
    boardId: string,
  ): Promise<ToggleBoardLikeResult> {
    requireSupabase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to like collections.");

    const { data: board } = await supabase
      .from("boards")
      .select("id, is_public, owner_id, deleted_at")
      .eq("id", boardId)
      .single();

    const boardRow = board as {
      id: string;
      is_public: boolean;
      owner_id: string;
      deleted_at: string | null;
    } | null;

    if (!boardRow || boardRow.deleted_at) {
      throw new Error("Collection not found.");
    }
    if (!boardRow.is_public) {
      throw new Error("Only public collections can be liked.");
    }
    if (boardRow.owner_id === user.id) {
      throw new Error("You cannot like your own collection.");
    }

    const { data: existing } = await supabase
      .from("board_likes")
      .select("board_id")
      .eq("board_id", boardId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("board_likes")
        .delete()
        .eq("board_id", boardId)
        .eq("user_id", user.id);
      if (error) throw new Error(parseSupabaseError(error));
    } else {
      const { error } = await supabase.from("board_likes").insert({
        board_id: boardId,
        user_id: user.id,
      });
      if (error) throw new Error(parseSupabaseError(error));

      void supabase
        .rpc("create_board_like_notification", { p_board_id: boardId })
        .then(({ error: notificationError }) => {
          if (
            notificationError &&
            !parseSupabaseError(notificationError).includes(
              "create_board_like_notification",
            )
          ) {
            console.warn("[velvet] like notification:", notificationError.message);
          }
        });
    }

    const { count, error: countError } = await supabase
      .from("board_likes")
      .select("*", { count: "exact", head: true })
      .eq("board_id", boardId);

    if (countError) throw new Error(parseSupabaseError(countError));

    return {
      liked: !existing,
      likeCount: count ?? 0,
    };
  },
};
