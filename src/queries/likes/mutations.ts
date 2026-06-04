"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  applyOptimisticBoardLike,
  setBoardLikeAcrossCache,
} from "@/lib/board-like-cache";
import { boardKeys } from "@/queries/board/keys";
import { discoverKeys } from "@/queries/discover/keys";
import { likeKeys } from "@/queries/likes/keys";
import { likesService } from "@/services/likes/likes.service";
import { velvetToast } from "@/lib/toast";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

export function useToggleBoardLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => likesService.toggleBoardLike(boardId),
    meta: { skipErrorToast: true },
    onMutate: async (boardId) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.all });
      await queryClient.cancelQueries({ queryKey: discoverKeys.all });
      await queryClient.cancelQueries({ queryKey: likeKeys.all });

      const snapshot = {
        discover: queryClient.getQueriesData({ queryKey: discoverKeys.all }),
        boards: queryClient.getQueriesData({ queryKey: boardKeys.all }),
        detail: queryClient.getQueryData(boardKeys.detail(boardId)),
        status: queryClient.getQueryData(likeKeys.status(boardId)),
      };

      const optimistic = applyOptimisticBoardLike(queryClient, boardId);

      return { snapshot, boardId, optimistic };
    },
    onError: (err, boardId, ctx) => {
      ctx?.snapshot.discover.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      ctx?.snapshot.boards.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (ctx?.snapshot.detail !== undefined) {
        queryClient.setQueryData(boardKeys.detail(boardId), ctx.snapshot.detail);
      }
      queryClient.setQueryData(likeKeys.status(boardId), ctx?.snapshot.status);
      velvetToast.fromError(err, "generic");
    },
    onSuccess: (result, boardId) => {
      setBoardLikeAcrossCache(
        queryClient,
        boardId,
        result.liked,
        result.likeCount,
      );
      if (result.liked) {
        track(ANALYTICS_EVENTS.COLLECTION_LIKED, {
          collection_id: boardId,
          like_count: result.likeCount,
        });
      }
    },
  });
}
