"use client";

import type { ReactNode } from "react";
import { BoardLikeButton } from "@/components/molecules/BoardLikeButton";
import { ShareButton } from "@/components/molecules/ShareButton";
import { ANALYTICS_EVENTS } from "@/lib/analytics";

interface CollectionCoverToolbarProps {
  back: ReactNode;
  boardId: string;
  likeCount: number;
  isLiked?: boolean;
  canLike: boolean;
  showLike?: boolean;
  share?: {
    url: string;
    title: string;
    text?: string;
    imageUrls?: string[];
  };
  /** Extra icon actions (e.g. share when collection is still private) */
  endSlot?: ReactNode;
}

/** Top hero bar — back left; share + like pill right (matches discover cards). */
export function CollectionCoverToolbar({
  back,
  boardId,
  likeCount,
  isLiked,
  canLike,
  showLike = true,
  share,
  endSlot,
}: CollectionCoverToolbarProps) {
  return (
    <>
      {back}
      <div className="flex items-center gap-2">
        {share && (
          <ShareButton
            variant="icon"
            url={share.url}
            title={share.title}
            text={share.text}
            imageUrls={share.imageUrls}
            eyebrow="Velvet collection"
            preview
            label="Share collection"
            analyticsEvent={ANALYTICS_EVENTS.COLLECTION_SHARED}
            analyticsProperties={{ collection_id: boardId }}
          />
        )}
        {endSlot}
        {showLike && (
          <BoardLikeButton
            boardId={boardId}
            likeCount={likeCount}
            isLiked={isLiked}
            canLike={canLike}
            appearance="footer"
            className="min-h-10 gap-1.5 px-3 py-2 shadow-md"
          />
        )}
      </div>
    </>
  );
}
