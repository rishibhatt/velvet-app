"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { notificationKeys } from "@/queries/notifications/keys";
import { createClient } from "@/services/supabase/client";
import { isSupabaseConfigured } from "@/lib/utils";

/**
 * Subscribes to Supabase Realtime postgres_changes on `notifications` for the
 * signed-in user. Refetches list + unread count when rows are inserted or updated.
 *
 * Requires migration 018_notifications_realtime.sql (or enabling the table in
 * Dashboard → Database → Publications).
 */
export function useNotificationRealtime() {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured() || !isAuthReady || !isAuthenticated || !user?.id) {
      return;
    }

    const supabase = createClient();
    const recipientFilter = `recipient_id=eq.${user.id}`;

    const syncNotifications = () => {
      void queryClient.refetchQueries({
        queryKey: notificationKeys.all,
        type: "active",
      });
    };

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: recipientFilter,
        },
        syncNotifications,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: recipientFilter,
        },
        syncNotifications,
      )
      .subscribe((status, err) => {
        if (process.env.NODE_ENV === "development" && status !== "SUBSCRIBED") {
          console.warn("[velvet] notifications realtime:", status, err?.message ?? err);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isAuthenticated, isAuthReady, queryClient, user?.id]);
}
