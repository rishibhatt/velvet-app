"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  readBoardLikeFromCache,
  setBoardLikeAcrossCache,
} from "@/lib/board-like-cache";
import {
  getPendingBoardLike,
  setPendingBoardLike,
  subscribePendingBoardLikes,
} from "@/lib/board-like-optimistic";
import { useToggleBoardLike } from "@/queries/likes/mutations";

interface BoardLikeDisplayInput {
  boardId: string;
  likeCount: number;
  isLiked: boolean;
}

/**
 * Instant like UI shared across all buttons/chips for the same board.
 */
export function useBoardLikeDisplay({
  boardId,
  likeCount: initialLikeCount,
  isLiked: initialIsLiked,
}: BoardLikeDisplayInput) {
  const queryClient = useQueryClient();
  const toggle = useToggleBoardLike();

  const pending = useSyncExternalStore(
    subscribePendingBoardLikes,
    () => getPendingBoardLike(boardId),
    () => null,
  );

  const cached = readBoardLikeFromCache(queryClient, boardId, {
    likeCount: initialLikeCount,
    isLiked: initialIsLiked,
  });

  const display = pending ?? cached;
  const isPending = toggle.isPending && toggle.variables === boardId;

  const toggleLike = useCallback(() => {
    if (isPending) return;

    const nextLiked = !display.isLiked;
    const nextCount = Math.max(0, display.likeCount + (nextLiked ? 1 : -1));

    setPendingBoardLike(boardId, { isLiked: nextLiked, likeCount: nextCount });

    toggle.mutate(boardId, {
      onError: () => {
        setPendingBoardLike(boardId, null);
        setBoardLikeAcrossCache(
          queryClient,
          boardId,
          cached.isLiked,
          cached.likeCount,
        );
      },
      onSuccess: (result) => {
        setPendingBoardLike(boardId, null);
        setBoardLikeAcrossCache(
          queryClient,
          boardId,
          result.liked,
          result.likeCount,
        );
      },
      onSettled: () => {
        setPendingBoardLike(boardId, null);
      },
    });
  }, [
    boardId,
    cached.isLiked,
    cached.likeCount,
    display.isLiked,
    display.likeCount,
    isPending,
    queryClient,
    toggle,
  ]);

  return {
    likeCount: display.likeCount,
    isLiked: display.isLiked,
    isPending,
    toggleLike,
  };
}
