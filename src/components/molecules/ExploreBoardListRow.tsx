"use client";

import { CollectionListRow } from "@/components/molecules/CollectionListRow";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getTrackedCollectionHref } from "@/lib/collection-href";
import type { Board, Profile } from "@/types/board.types";
import type { PublicBoard } from "@/services/discover/discover.service";

interface ExploreBoardListRowProps {
  board: Board | PublicBoard;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  onClick?: () => void;
}

export function ExploreBoardListRow({
  board,
  owner,
  onClick,
}: ExploreBoardListRowProps) {
  const { user } = useAuth();
  const href = getTrackedCollectionHref(board, {
    userId: user?.id,
    ownerUsername: owner?.username ?? board.owner?.username,
    preset: "internal_explore",
  });

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
