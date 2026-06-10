"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/atoms/Button";
import { PageBackButton } from "@/components/molecules/PageBackButton";
import { CollectionCoverHero } from "@/components/molecules/CollectionCoverHero";
import { CollectionCoverToolbar } from "@/components/molecules/CollectionCoverToolbar";
import { CollectionHeroStatsRow } from "@/components/molecules/CollectionHeroStatsRow";
import { CollectionCollaborationStrip } from "@/components/molecules/CollectionCollaborationStrip";
import { useBoardActivity } from "@/queries/activity/queries";
import { useUIStore } from "@/store/ui.store";
import { useLazyMount } from "@/hooks/useLazyMount";

const CollabPanel = dynamic(
  () =>
    import("@/components/organisms/CollabPanel").then((m) => ({
      default: m.CollabPanel,
    })),
  { ssr: false },
);
import { useCollectionCollaborationState } from "@/hooks/useCollectionCollaborationState";
import { getMoodEmoji } from "@/constants/moods";
import { getMoodDisplayLabel } from "@/constants/moods";
import { PublicItemGrid } from "@/features/collections/components/PublicItemGrid";
import { VelvetLogo } from "@/components/atoms/VelvetLogo";
import { AdaptiveNavbar } from "@/components/organisms/AdaptiveNavbar";
import { CollectionLinks } from "@/components/seo/CollectionLinks";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { canEditBoardItems } from "@/lib/board-permissions";
import { likesService } from "@/services/likes/likes.service";
import { likeKeys } from "@/queries/likes/keys";
import { useBoardLikeDisplay } from "@/hooks/useBoardLikeDisplay";
import { ROUTES, getPublicShareUrl } from "@/constants/routes";
import { previewImagesFromItems } from "@/lib/collection-previews";
import { BoardViewTracker } from "@/features/collections/components/BoardViewTracker";
import type { Board, Item, Tag } from "@/types/board.types";

interface PublicCollectionViewProps {
  board: Board;
  items: Item[];
  owner: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  tags?: Tag[];
  moreFromCreator?: Board[];
  relatedCollections?: Board[];
}

export function PublicCollectionView({
  board: initialBoard,
  items,
  owner,
  tags = [],
  moreFromCreator = [],
  relatedCollections = [],
}: PublicCollectionViewProps) {
  const router = useRouter();
  const { isAuthenticated, isAuthReady, user } = useAuth();
  const { collabPanelOpen, setCollabPanelOpen } = useUIStore();
  const showCollab = useLazyMount(collabPanelOpen);

  useEffect(() => {
    if (!isAuthReady || !user) return;
    if (canEditBoardItems(initialBoard, user.id)) {
      router.replace(ROUTES.board(initialBoard.id));
    }
  }, [initialBoard, isAuthReady, router, user]);
  const { isMember, isOwner } = useCollectionCollaborationState(
    initialBoard,
    user?.id,
  );
  const { data: activities = [] } = useBoardActivity(
    isAuthenticated ? initialBoard.id : "",
  );

  const { data: isLiked } = useQuery({
    queryKey: likeKeys.status(initialBoard.id),
    queryFn: async () => {
      const ids = await likesService.getLikedBoardIds([initialBoard.id]);
      return ids.has(initialBoard.id);
    },
    enabled: isAuthReady && isAuthenticated && Boolean(user?.id),
    staleTime: 60_000,
  });

  const { likeCount, isLiked: displayLiked } = useBoardLikeDisplay({
    boardId: initialBoard.id,
    likeCount: initialBoard.like_count ?? 0,
    isLiked: isLiked ?? initialBoard.is_liked ?? false,
  });

  const board: Board = {
    ...initialBoard,
    is_liked: displayLiked,
    like_count: likeCount,
  };

  const heroImages = previewImagesFromItems(items);
  const itemCount = board.item_count ?? items.length;
  const collaboratorCount = board.members?.length ?? 0;
  const canLike =
    isAuthReady && isAuthenticated && user != null && user.id !== board.owner_id;
  const moodLabel = getMoodDisplayLabel(board.mood, board.mood_label);
  const publicUrl =
    owner && board.slug ? ROUTES.publicCollection(owner.username, board.slug) : undefined;
  const shareUrl =
    owner && board.slug ? getPublicShareUrl(owner.username, board.slug) : undefined;

  const totalResaves = items.reduce((sum, i) => sum + (i.resave_count ?? 0), 0);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <BoardViewTracker boardId={board.id} mood={board.mood} source="share" />
      <AdaptiveNavbar />
      <CollectionCoverHero
        size="public"
        overlay={
          <CollectionCoverToolbar
            back={
              <PageBackButton
                href={ROUTES.explore}
                label="Explore"
                className="border-white/40 bg-bg-elevated/90 shadow-md backdrop-blur-md"
              />
            }
            boardId={board.id}
            likeCount={likeCount}
            isLiked={board.is_liked}
            canLike={canLike}
            share={
              shareUrl
                ? {
                    url: shareUrl,
                    title: board.title,
                    text: board.description ?? undefined,
                    imageUrls: heroImages,
                  }
                : undefined
            }
          />
        }
        images={heroImages}
        itemCount={itemCount}
        emptyVariant="other"
        title={board.title}
        description={board.description}
        badge={
          <span className="inline-flex rounded-full bg-bg-elevated px-3 py-1 text-xs font-bold text-primary shadow-sm ring-1 ring-outline-variant/20">
            {getMoodEmoji(board.mood)} {moodLabel}
          </span>
        }
        meta={
          <div className="space-y-3">
            {owner ? (
              <p className="text-sm text-on-surface">
                Curated by{" "}
                <Link
                  href={ROUTES.creator(owner.username)}
                  className="font-semibold text-primary hover:underline"
                >
                  {owner.full_name ?? owner.username}
                </Link>
              </p>
            ) : null}
            <CollectionHeroStatsRow
              itemCount={itemCount}
              likeCount={likeCount}
              boardId={board.id}
              isLiked={board.is_liked}
              canLike={canLike}
              collaboratorCount={collaboratorCount}
              viewCount={board.view_count ?? 0}
              resaveCount={totalResaves}
              showLikeChip
            />
          </div>
        }
      />

      <main className="page-container py-stack-lg pb-28 md:pb-12">
        {!isOwner && (
          <CollectionCollaborationStrip
            board={board}
            userId={user?.id}
            likeCount={likeCount}
            collaboratorCount={collaboratorCount}
            className="mb-8"
          />
        )}
        {tags.length > 0 && (
          <section className="mb-8 flex flex-wrap gap-2 text-sm">
            {board.mood && (
              <Link
                className="rounded-full bg-surface-container px-3 py-1 font-medium text-primary"
                href={ROUTES.category(board.mood)}
              >
                {moodLabel}
              </Link>
            )}
            {tags.map((tag) => (
              <Link
                key={tag.id}
                className="rounded-full bg-surface-container px-3 py-1 font-medium text-primary"
                href={ROUTES.tag(tag.name.toLowerCase().replace(/\s+/g, "-"))}
              >
                <span
                  onClick={() =>
                    track(ANALYTICS_EVENTS.EXPLORE_TAG_CLICKED, {
                      tag: tag.name,
                      collection_id: board.id,
                    })
                  }
                >
                  #{tag.name}
                </span>
              </Link>
            ))}
          </section>
        )}

        {items.length > 0 ? (
          <PublicItemGrid
            items={items}
            curatorLabel={owner?.full_name ?? owner?.username ?? "Creator"}
          />
        ) : (
          <p className="py-12 text-center text-on-surface-variant">
            This collection is waiting for its first save.
          </p>
        )}

        {(moreFromCreator.length > 0 || relatedCollections.length > 0) && (
          <section className="mt-12 grid gap-8 md:grid-cols-2">
            <CollectionLinks title="More from creator" boards={moreFromCreator} owner={owner} />
            <CollectionLinks title="Related collections" boards={relatedCollections} />
          </section>
        )}

        {isAuthReady && !isAuthenticated && (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-primary/20 bg-primary-fixed/30 p-6 text-center sm:mt-16 sm:p-10">
            <h2 className="font-display text-xl text-on-surface sm:text-2xl">
              Love this collection?
            </h2>
            <p className="max-w-md text-sm text-on-surface-variant sm:text-base">
              Sign up for Velvet to save your own version and keep curating what matters to you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={ROUTES.signup}>
                <Button size="lg">Start your velvet world</Button>
              </Link>
              <Link href={ROUTES.login}>
                <Button variant="secondary" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {isMember && user && showCollab ? (
        <CollabPanel
          open={collabPanelOpen}
          onClose={() => setCollabPanelOpen(false)}
          boardId={board.id}
          members={board.members ?? []}
          activities={activities}
          canManage={isOwner}
          ownerId={board.owner_id}
          isPublic={board.is_public}
        />
      ) : null}

      <footer className="flex flex-col items-center gap-3 border-t border-outline-variant/20 py-8 text-center text-sm text-on-surface-variant">
        <VelvetLogo
          variant="footer"
          href={isAuthenticated ? ROUTES.home : ROUTES.explore}
        />
        <p>Your velvet world.</p>
      </footer>
    </div>
  );
}
