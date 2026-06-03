import { parseSupabaseError, requireSupabase } from "@/lib/supabase-errors";
import { isSupabaseConfigured } from "@/lib/utils";
import { createClient } from "@/services/supabase/client";
import type { AppNotification } from "@/types/board.types";
import type { Database } from "@/types/database.types";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"] & {
  actor?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    recipient_id: row.recipient_id,
    actor_id: row.actor_id,
    type: row.type as AppNotification["type"],
    title: row.title,
    body: row.body,
    resource_type: row.resource_type,
    resource_id: row.resource_id,
    metadata: row.metadata as Record<string, unknown> | null,
    read_at: row.read_at,
    created_at: row.created_at,
    actor: row.actor ?? null,
  };
}

export const notificationsService = {
  async list(): Promise<AppNotification[]> {
    if (!isSupabaseConfigured()) return [];
    requireSupabase();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
          *,
          actor:profiles!notifications_actor_id_fkey(id, username, full_name, avatar_url)
        `,
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(parseSupabaseError(error));
    return (data ?? []).map((row) =>
      mapNotification(row as unknown as NotificationRow),
    );
  },

  async unreadCount(): Promise<number> {
    if (!isSupabaseConfigured()) return 0;
    requireSupabase();
    const supabase = createClient();
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .is("read_at", null);

    if (error) throw new Error(parseSupabaseError(error));
    return count ?? 0;
  },

  async markRead(notificationId: string): Promise<void> {
    requireSupabase();
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .is("read_at", null);

    if (error) throw new Error(parseSupabaseError(error));
  },

  async markAllRead(): Promise<void> {
    requireSupabase();
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);

    if (error) throw new Error(parseSupabaseError(error));
  },

  async respondToInvite(
    invitationId: string,
    accept: boolean,
  ): Promise<{ boardId: string }> {
    requireSupabase();
    const supabase = createClient();
    const { data, error } = await supabase.rpc("respond_board_invitation", {
      p_invitation_id: invitationId,
      p_accept: accept,
    });

    if (error) throw new Error(parseSupabaseError(error));
    return { boardId: data as string };
  },

  async respondToCollabRequest(
    requestId: string,
    accept: boolean,
  ): Promise<{ boardId: string }> {
    requireSupabase();
    const supabase = createClient();
    const { data, error } = await supabase.rpc("respond_collaboration_request", {
      p_request_id: requestId,
      p_accept: accept,
    });

    if (error) throw new Error(parseSupabaseError(error));
    return { boardId: data as string };
  },
};
