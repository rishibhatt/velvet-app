import { ROUTES } from "@/constants/routes";
import { canEditBoardItems } from "@/lib/board-permissions";
import type { Board } from "@/types/board.types";

type CollectionLinkBoard = Pick<Board, "id" | "owner_id" | "slug" | "is_public"> & {
  members?: Board["members"];
};

/**
 * Workspace route for owners/collaborators; public canonical URL for visitors.
 */
export function getCollectionHref(
  board: CollectionLinkBoard,
  options?: {
    userId?: string | null;
    ownerUsername?: string | null;
  },
): string {
  const { userId, ownerUsername } = options ?? {};

  if (userId && canEditBoardItems(board as Board, userId)) {
    return ROUTES.board(board.id);
  }

  if (board.is_public && board.slug && ownerUsername) {
    return ROUTES.publicCollection(ownerUsername, board.slug);
  }

  if (board.is_public && board.slug) {
    return ROUTES.legacyPublicCollection(board.slug);
  }

  return ROUTES.board(board.id);
}
