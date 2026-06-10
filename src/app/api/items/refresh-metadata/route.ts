import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { canEditBoardItems } from "@/lib/board-permissions";
import { refreshBoardItemMetadata } from "@/lib/refresh-item-metadata";
import { createClient } from "@/services/supabase/server";

export async function POST(request: Request) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  try {
    const body = (await request.json()) as {
      boardId?: string;
      force?: boolean;
    };

    if (!body.boardId || typeof body.boardId !== "string") {
      return NextResponse.json({ error: "boardId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("id, owner_id, is_public, slug, members:board_members(user_id, role)")
      .eq("id", body.boardId)
      .single();

    if (boardError || !board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    if (!canEditBoardItems(board as never, user!.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await refreshBoardItemMetadata(
      supabase,
      user!.id,
      body.boardId,
      { force: body.force === true },
    );

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
