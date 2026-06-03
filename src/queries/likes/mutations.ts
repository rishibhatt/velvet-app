"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likesService } from "@/services/likes/likes.service";
import { discoverKeys } from "@/queries/discover/keys";
import { boardKeys } from "@/queries/board/keys";
import { velvetToast } from "@/lib/toast";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import type { PublicBoard } from "@/services/discover/discover.service";
import type { Board } from "@/types/board.types";

function patchBoardLike(
  board: Board | PublicBoard,
  liked: boolean,
  likeCount: number,
) {
  return {
    ...board,
    is_liked: liked,
    like_count: likeCount,
  };
}

export function useToggleBoardLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => likesService.toggleBoardLike(boardId),
    meta: { skipErrorToast: true },
    onMutate: async (boardId) => {
      await queryClient.cancelQueries({ queryKey: discoverKeys.all });
      const previousDiscover = queryClient.getQueriesData<PublicBoard[]>({
        queryKey: discoverKeys.all,
      });

      const updateList = (boards: PublicBoard[] | undefined) =>
        boards?.map((b) =>
          b.id === boardId
            ? patchBoardLike(
                b,
                !b.is_liked,
                Math.max(0, (b.like_count ?? 0) + (b.is_liked ? -1 : 1)),
              )
            : b,
        );

      queryClient.setQueriesData<PublicBoard[]>(
        { queryKey: discoverKeys.all },
        (old) => updateList(old),
      );

      const detailKey = boardKeys.detail(boardId);
      const prevDetail = queryClient.getQueryData<Board>(detailKey);
      if (prevDetail?.is_public) {
        queryClient.setQueryData<Board>(detailKey, (old) =>
          old
            ? patchBoardLike(
                old,
                !old.is_liked,
                Math.max(0, (old.like_count ?? 0) + (old.is_liked ? -1 : 1)),
              )
            : old,
        );
      }

      return { previousDiscover, prevDetail, boardId };
    },
    onError: (err, _boardId, ctx) => {
      ctx?.previousDiscover.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (ctx?.prevDetail) {
        queryClient.setQueryData(boardKeys.detail(ctx.boardId), ctx.prevDetail);
      }
      velvetToast.fromError(err, "generic");
    },
    onSuccess: (result, boardId) => {
      const patch = (b: Board | PublicBoard) =>
        b.id === boardId ? patchBoardLike(b, result.liked, result.likeCount) : b;

      queryClient.setQueriesData<PublicBoard[]>(
        { queryKey: discoverKeys.all },
        (old) => old?.map(patch),
      );
      queryClient.setQueryData<Board>(boardKeys.detail(boardId), (old) =>
        old ? patch(old) : old,
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
