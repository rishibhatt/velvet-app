"use client";

import { BoardLikeButton } from "@/components/molecules/BoardLikeButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Board } from "@/types/board.types";

interface PublicCollectionActionsProps {
  board: Board;
  ownerId: string;
}

export function PublicCollectionActions({
  board,
  ownerId,
}: PublicCollectionActionsProps) {
  const { user, isAuthenticated, isAuthReady } = useAuth();

  const canLike =
    isAuthReady && isAuthenticated && user != null && user.id !== ownerId;

  return (
    <BoardLikeButton
      boardId={board.id}
      likeCount={board.like_count ?? 0}
      isLiked={board.is_liked}
      canLike={canLike}
      size="md"
    />
  );
}
