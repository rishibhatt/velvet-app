"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { boardKeys } from "@/queries/board/keys";
import { notificationKeys } from "@/queries/notifications/keys";
import { notificationsService } from "@/services/notifications/notifications.service";
import { velvetToast } from "@/lib/toast";
import { ROUTES } from "@/constants/routes";

function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markRead(notificationId),
    meta: { errorContext: "generic" },
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    meta: { errorContext: "generic" },
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useRespondBoardInvite() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      invitationId,
      accept,
    }: {
      invitationId: string;
      accept: boolean;
    }) => notificationsService.respondToInvite(invitationId, accept),
    meta: { skipErrorToast: true },
    onSuccess: ({ boardId }, variables) => {
      invalidateNotifications(queryClient);
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });

      if (variables.accept) {
        velvetToast.success("Invite accepted", "The collection is now in your workspace.");
        router.push(ROUTES.board(boardId));
      } else {
        velvetToast.success("Invite declined");
      }
    },
    onError: (err) => {
      velvetToast.fromError(err, "generic");
    },
  });
}
