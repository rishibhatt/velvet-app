"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications/notifications.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { notificationKeys } from "@/queries/notifications/keys";

export function useNotifications() {
  const { isAuthenticated, isAuthReady } = useAuth();
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationsService.list(),
    enabled: isAuthReady && isAuthenticated,
    meta: { skipErrorToast: true },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useUnreadNotificationCount() {
  const { isAuthenticated, isAuthReady } = useAuth();
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsService.unreadCount(),
    enabled: isAuthReady && isAuthenticated,
    meta: { skipErrorToast: true },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}
