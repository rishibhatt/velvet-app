import { hashSHA256 } from "@/lib/hash";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";
import { createClient } from "@/services/supabase/server";

const MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000];

export const viewsService = {
  async trackView(input: {
    boardId: string;
    source?: string;
    referrer?: string | null;
    ip?: string;
    userAgent?: string;
  }): Promise<{ ok: true }> {
    if (!isServiceRoleConfigured()) return { ok: true };

    const { boardId, source, referrer, ip, userAgent } = input;
    const today = new Date().toISOString().split("T")[0]!;
    const raw = `${ip ?? "unknown"}:${userAgent ?? ""}:${today}:${boardId}`;
    const fingerprint = await hashSHA256(raw);

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from("board_views")
      .select("id")
      .eq("board_id", boardId)
      .eq("viewer_fingerprint", fingerprint)
      .gte("viewed_at", `${today}T00:00:00Z`)
      .maybeSingle();

    const isUnique = !existing;

    const sessionClient = await createClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();
    const viewerId = user?.id ?? null;

    const { data: board } = await supabase
      .from("boards")
      .select("owner_id, is_public, view_count, title")
      .eq("id", boardId)
      .single();

    if (!board?.is_public) return { ok: true };
    if (viewerId && viewerId === board.owner_id) return { ok: true };

    await supabase.from("board_views").insert({
      board_id: boardId,
      viewer_id: viewerId,
      viewer_fingerprint: fingerprint,
      source: source ?? "direct",
      referrer: referrer ?? null,
    });

    await supabase.rpc("increment_board_view", {
      p_board_id: boardId,
      p_is_unique: isUnique,
      p_owner_id: board.owner_id,
    });

    const newCount = (board.view_count ?? 0) + 1;
    if (MILESTONES.includes(newCount)) {
      await supabase.from("notifications").insert({
        recipient_id: board.owner_id,
        type: "board_viewed_milestone",
        title: `"${board.title}" just hit ${newCount} views!`,
        body: "Your collection is getting noticed.",
        resource_type: "board",
        resource_id: boardId,
        metadata: {
          count: newCount,
          milestone: `${newCount}_views`,
          title: board.title,
          boardId,
        },
      });
    }

    return { ok: true };
  },
};
