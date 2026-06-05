import { ROUTES } from "@/constants/routes";
import type { PublicBoard } from "@/services/discover/discover.service";

export function boardPublicHref(board: PublicBoard) {
  return board.slug && board.owner?.username
    ? ROUTES.publicCollection(board.owner.username, board.slug)
    : undefined;
}
