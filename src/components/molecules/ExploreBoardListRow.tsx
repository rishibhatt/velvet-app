"use client";

import { ROUTES } from "@/constants/routes";
import { CollectionListRow } from "@/components/molecules/CollectionListRow";
import type { Board, Profile } from "@/types/board.types";
import type { PublicBoard } from "@/services/discover/discover.service";

interface ExploreBoardListRowProps {
  board: Board | PublicBoard;
  publicHref?: string;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  onClick?: () => void;
}

export function ExploreBoardListRow({
  board,
  publicHref,
  owner,
  onClick,
}: ExploreBoardListRowProps) {
  const href = publicHref ?? ROUTES.board(board.id);

  return (
    <CollectionListRow
      board={board}
      href={href}
      owner={owner}
      scope="public"
      onClick={onClick}
    />
  );
}
