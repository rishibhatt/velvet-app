"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications/notifications.service";
import { notificationKeys } from "@/queries/notifications/keys";
import { boardKeys } from "@/queries/board/keys";
import { activityKeys } from "@/queries/activity/queries";
import { collabRequestKeys } from "./keys";
import { velvetToast } from "@/lib/toast";

export function useRespondCollaborationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      accept,
    }: {
      requestId: string;
      accept: boolean;
    }) => notificationsService.respondToCollabRequest(requestId, accept),
    meta: { skipErrorToast: true },
    onSuccess: ({ boardId }, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: collabRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
      queryClient.invalidateQueries({ queryKey: activityKeys.board(boardId) });

      if (variables.accept) {
        velvetToast.success("Request accepted", "They can now collaborate on this collection.");
      } else {
        velvetToast.success("Request declined");
      }
    },
    onError: (err) => {
      velvetToast.fromError(err, "generic");
    },
  });
}
