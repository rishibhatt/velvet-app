import { NextResponse } from "next/server";
import { resavesService } from "@/services/resaves/resaves.service";
import { createClient } from "@/services/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const targetBoardId = body.target_board_id as string | undefined;
  if (!targetBoardId) {
    return NextResponse.json({ error: "target_board_id required" }, { status: 400 });
  }

  try {
    const item = await resavesService.resaveItem(id, targetBoardId, user.id);
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to resave";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
