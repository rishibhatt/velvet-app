"use client";

import { AdaptiveNavbar } from "@/components/organisms/AdaptiveNavbar";
import { PageBackButton } from "@/components/molecules/PageBackButton";
import { ShareButton } from "@/components/molecules/ShareButton";
import { Avatar } from "@/components/atoms/Avatar";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { VelvetLogo } from "@/components/atoms/VelvetLogo";
import { BoardCard } from "@/components/organisms/BoardCard";
import { CollectionCardSkeleton } from "@/components/organisms/CollectionCard";
import { PageWidth, PageWidthFrame } from "@/components/layouts/PageWidth";
import { COLLECTION_CARD_GRID } from "@/constants/collection-ui";
import { ROUTES } from "@/constants/routes";
import { getCreatorProfileUrl } from "@/lib/app-url";
import { useInfiniteSlice } from "@/hooks/useInfiniteSlice";
import { ANALYTICS_EVENTS } from "@/lib/analytics";
import type { Board } from "@/types/board.types";

interface CreatorProfile {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  website: string | null;
}

interface CreatorProfileViewProps {
  profile: CreatorProfile;
  boards: Board[];
}

export function CreatorProfileView({ profile, boards }: CreatorProfileViewProps) {
  const { visible, sentinelRef, hasMore } = useInfiniteSlice(boards, 12);
  const owner = {
    username: profile.username,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  };
  const shareUrl = getCreatorProfileUrl(profile.username);

  return (
    <div className="relative min-h-screen bg-background pb-24 md:pb-0">
      <AdaptiveNavbar />

      <PageWidthFrame>
        <div className="relative h-32 overflow-hidden sm:h-40 md:h-48 md:rounded-2xl">
          <div className="absolute inset-0 z-0">
            {profile.banner_url ? (
              <VelvetImage
                src={profile.banner_url}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, min(100vw, 1280px)"
                priority
              />
            ) : (
              <div
                className="h-full w-full bg-gradient-to-r from-accent-blush via-accent-coral to-accent-lavender"
                aria-hidden
              />
            )}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 bg-gradient-to-b from-black/15 to-transparent sm:h-24"
            aria-hidden
          />
          <div className="absolute inset-x-0 top-0 z-20 px-4 pt-4 sm:px-6 md:px-0">
            <div className="flex items-center justify-between gap-3">
              <PageBackButton
                href={ROUTES.explore}
                label="Explore"
                className="border-white/40 bg-bg-elevated/90 shadow-md backdrop-blur-md"
              />
              <ShareButton
                variant="icon"
                url={shareUrl}
                title={`${profile.full_name ?? profile.username} on Velvet`}
                text={profile.bio ?? undefined}
                imageUrl={profile.avatar_url ?? profile.banner_url}
                eyebrow="Velvet profile"
                preview
                label="Share profile"
                analyticsEvent={ANALYTICS_EVENTS.PROFILE_SHARED}
                analyticsProperties={{ username: profile.username }}
              />
            </div>
          </div>
        </div>
      </PageWidthFrame>

      <PageWidth as="header" className="relative z-10 pb-6 text-center">
        <div className="-mt-12 sm:-mt-14">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name ?? profile.username}
            size="xl"
            className="mx-auto mb-3 ring-4 ring-background shadow-md"
          />
        </div>
        <h1 className="font-display text-2xl text-on-surface sm:text-3xl">
          {profile.full_name ?? profile.username}
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">@{profile.username}</p>
        {profile.bio && (
          <p className="mx-auto mt-3 max-w-lg text-sm text-on-surface-variant sm:text-base">
            {profile.bio}
          </p>
        )}
        {profile.website && (
          <a
            href={
              profile.website.startsWith("http")
                ? profile.website
                : `https://${profile.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        )}
        <p className="mt-3 text-sm font-medium text-on-surface-variant">
          {boards.length} public collection{boards.length === 1 ? "" : "s"}
        </p>
      </PageWidth>

      <PageWidth as="main" className="pb-20">
        <h2 className="font-display mb-4 text-lg text-on-surface sm:text-xl">
          Public collections
        </h2>
        {boards.length > 0 ? (
          <>
            <div className={COLLECTION_CARD_GRID}>
              {visible.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  owner={owner}
                  showLike
                  emptyVariant="other"
                />
              ))}
            </div>
            {hasMore && (
              <div ref={sentinelRef} className={`${COLLECTION_CARD_GRID} mt-3`}>
                <CollectionCardSkeleton />
                <CollectionCardSkeleton />
              </div>
            )}
          </>
        ) : (
          <p className="rounded-2xl bg-surface-container-low py-12 text-center text-on-surface-variant">
            No public collections yet.
          </p>
        )}

        <div className="mt-12 flex flex-col items-center gap-2 text-sm text-on-surface-variant">
          <span>Curated on</span>
          <VelvetLogo variant="footer" href={ROUTES.home} />
        </div>
      </PageWidth>
    </div>
  );
}
