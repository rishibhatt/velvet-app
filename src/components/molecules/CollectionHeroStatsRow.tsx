"use client";

import { Layers, Users } from "lucide-react";
import { formatCount } from "@/utils/format";
import { CollectionHeroStatChip } from "./CollectionHeroStatChip";
import { BoardLikeButton } from "./BoardLikeButton";

interface CollectionHeroStatsRowProps {
  itemCount: number;
  likeCount: number;
  boardId: string;
  isLiked?: boolean;
  canLike?: boolean;
  showLike?: boolean;
  collaboratorCount?: number;
  /** Show like in stats row (public visitor) vs only in toolbar */
  showLikeChip?: boolean;
}

export function CollectionHeroStatsRow({
  itemCount,
  likeCount,
  boardId,
  isLiked,
  canLike = false,
  showLike = true,
  collaboratorCount = 0,
  showLikeChip = false,
}: CollectionHeroStatsRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CollectionHeroStatChip icon={<Layers className="h-3.5 w-3.5 text-primary" aria-hidden />}>
        {formatCount(itemCount)} {itemCount === 1 ? "item" : "items"}
      </CollectionHeroStatChip>

      {collaboratorCount > 0 && (
        <CollectionHeroStatChip icon={<Users className="h-3.5 w-3.5 text-primary" aria-hidden />}>
          {formatCount(collaboratorCount)} curators
        </CollectionHeroStatChip>
      )}

      {showLikeChip && showLike && (
        <BoardLikeButton
          boardId={boardId}
          likeCount={likeCount}
          isLiked={isLiked}
          canLike={canLike}
          appearance="footer"
          className="shadow-sm"
        />
      )}

      {!showLikeChip && likeCount > 0 && (
        <CollectionHeroStatChip>
          {formatCount(likeCount)} {likeCount === 1 ? "like" : "likes"}
        </CollectionHeroStatChip>
      )}
    </div>
  );
}
