"use client";

import { Eye, Layers, Repeat2, Users } from "lucide-react";
import { formatViewCount } from "@/lib/format-view-count";
import { formatCount } from "@/utils/format";
import { CollectionHeroStatChip } from "./CollectionHeroStatChip";
import { BoardLikeButton } from "./BoardLikeButton";
import { useBoardLikeDisplay } from "@/hooks/useBoardLikeDisplay";

interface CollectionHeroStatsRowProps {
  itemCount: number;
  likeCount: number;
  boardId: string;
  isLiked?: boolean;
  canLike?: boolean;
  showLike?: boolean;
  collaboratorCount?: number;
  viewCount?: number;
  resaveCount?: number;
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
  viewCount = 0,
  resaveCount = 0,
  showLikeChip = false,
}: CollectionHeroStatsRowProps) {
  const { likeCount: displayCount } = useBoardLikeDisplay({
    boardId,
    likeCount,
    isLiked: isLiked ?? false,
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CollectionHeroStatChip icon={<Layers className="h-3.5 w-3.5 text-primary" aria-hidden />}>
        {formatCount(itemCount)} {itemCount === 1 ? "item" : "items"}
      </CollectionHeroStatChip>

      {viewCount > 0 && (
        <CollectionHeroStatChip icon={<Eye className="h-3.5 w-3.5 text-primary" aria-hidden />}>
          {formatViewCount(viewCount)} views
        </CollectionHeroStatChip>
      )}

      {resaveCount > 0 && (
        <CollectionHeroStatChip icon={<Repeat2 className="h-3.5 w-3.5 text-primary" aria-hidden />}>
          {formatCount(resaveCount)} re-saves
        </CollectionHeroStatChip>
      )}

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

      {!showLikeChip && displayCount > 0 && (
        <CollectionHeroStatChip>
          {formatCount(displayCount)} {displayCount === 1 ? "like" : "likes"}
        </CollectionHeroStatChip>
      )}
    </div>
  );
}
