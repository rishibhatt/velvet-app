import {
  CollectionCard,
  CollectionCardSkeleton,
  type CollectionCardProps,
  type CollectionCardVariant,
} from "@/components/organisms/CollectionCard";
import type { Board, Profile } from "@/types/board.types";

export type ShowcaseBoardVariant = "discover" | "owned";

interface ShowcaseBoardCardProps {
  board: Board;
  variant?: ShowcaseBoardVariant;
  publicHref?: string;
  owner?: Pick<Profile, "username" | "full_name" | "avatar_url">;
  className?: string;
  trafficPreset?: CollectionCardProps["trafficPreset"];
  trafficContext?: CollectionCardProps["trafficContext"];
}

export function ShowcaseBoardCard({
  board,
  variant = "discover",
  publicHref,
  owner,
  className,
  trafficPreset,
  trafficContext,
}: ShowcaseBoardCardProps) {
  return (
    <CollectionCard
      board={board}
      variant={variant as CollectionCardVariant}
      publicHref={publicHref}
      owner={owner}
      className={className}
      trafficPreset={trafficPreset}
      trafficContext={trafficContext}
    />
  );
}

export function ShowcaseBoardCardSkeleton({ className }: { className?: string }) {
  return <CollectionCardSkeleton className={className} />;
}
