import type { CollectionPosterEmptyVariant } from "@/components/molecules/CollectionPosterGrid";
import {
  CollectionCard,
  CollectionCardSkeleton,
  type CollectionCardProps,
  type CollectionCardVariant,
} from "@/components/organisms/CollectionCard";
import type { Board, Profile } from "@/types/board.types";

interface BoardCardProps {
  board: Board;
  variant?: CollectionCardVariant;
  publicHref?: string;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  /** @deprecated Like is always shown in the unified card footer */
  showLike?: boolean;
  emptyVariant?: CollectionPosterEmptyVariant;
  className?: string;
  onClick?: () => void;
}

export function BoardCard({
  board,
  variant = "discover",
  publicHref,
  owner,
  showLike: _showLike,
  emptyVariant,
  className,
  onClick,
}: BoardCardProps) {
  return (
    <CollectionCard
      board={board}
      variant={variant}
      publicHref={publicHref}
      owner={owner}
      emptyVariant={emptyVariant}
      className={className}
      onClick={onClick}
    />
  );
}

export function BoardCardSkeleton({ className }: { className?: string }) {
  return <CollectionCardSkeleton className={className} />;
}

export type { CollectionCardProps };
