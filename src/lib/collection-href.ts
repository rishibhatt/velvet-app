import { ROUTES } from "@/constants/routes";
import { buildTrackedUrl } from "@/lib/attribution";
import type { PresetContext, TrackedLinkPreset } from "@/lib/attribution";
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

/**
 * Public collection link with internal attribution UTMs + src for board_views.
 */
export function getTrackedCollectionHref(
  board: CollectionLinkBoard,
  options: {
    userId?: string | null;
    ownerUsername?: string | null;
    preset: TrackedLinkPreset;
    presetContext?: PresetContext;
  },
): string {
  const path = getCollectionHref(board, options);
  if (path.startsWith("/boards/")) return path;

  return buildTrackedUrl(path, options.preset, {
    username: options.ownerUsername ?? undefined,
    slug: board.slug ?? undefined,
    ...options.presetContext,
  });
}
