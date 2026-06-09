"use client";

import dynamic from "next/dynamic";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { resolveHeroPreviewImages } from "@/lib/collection-previews";
import { Share2 } from "lucide-react";
import { IconButton } from "@/components/atoms/IconButton";
import { CollectionSaveFab } from "@/components/molecules/CollectionSaveFab";
import { BoardDetailPageSkeleton } from "@/components/skeletons/BoardDetailPageSkeleton";
import { SKELETON_BOARD_ITEMS_COUNT } from "@/constants/skeleton-layout";
import { CollectionCoverToolbar } from "@/components/molecules/CollectionCoverToolbar";
import { CollectionHeroStatsRow } from "@/components/molecules/CollectionHeroStatsRow";
import { PageBackButton } from "@/components/molecules/PageBackButton";
import { ROUTES, getPublicShareUrl } from "@/constants/routes";
import {
  canEditBoardItems,
  canEditBoardMeta,
  canManageBoardSettings,
} from "@/lib/board-permissions";
import { velvetToast } from "@/lib/toast";
import { ErrorAlert } from "@/components/molecules/ErrorAlert";
import { CollectionBoardActions } from "@/components/molecules/CollectionBoardActions";
import { ItemCard, ItemCardSkeleton } from "@/components/organisms/ItemCard";
import { CollectionItemsGrid } from "@/components/organisms/CollectionItemsGrid";
import { useBoardDetail } from "@/queries/board/queries";
import { useItems } from "@/queries/item/queries";
import { useBoardActivity } from "@/queries/activity/queries";
import { useModalStore } from "@/store/modal.store";
import { useUIStore } from "@/store/ui.store";
import { getMoodEmoji } from "@/constants/moods";
import { createClient } from "@/services/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { itemKeys } from "@/queries/board/keys";
import { activityKeys } from "@/queries/activity/queries";
import { isSupabaseConfigured } from "@/lib/utils";
import { CollectionAddCard } from "@/components/molecules/CollectionAddCard";
import { CollectionCoverHero } from "@/components/molecules/CollectionCoverHero";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useLazyMount } from "@/hooks/useLazyMount";

const CollabPanel = dynamic(
  () =>
    import("@/components/organisms/CollabPanel").then((m) => ({
      default: m.CollabPanel,
    })),
  { ssr: false },
);

const BoardSettingsModal = dynamic(
  () =>
    import("@/features/boards/components/BoardSettingsModal").then((m) => ({
      default: m.BoardSettingsModal,
    })),
  { ssr: false },
);

export default function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: board,
    isLoading: boardLoading,
    isError: boardError,
    error: boardErr,
    refetch: refetchBoard,
  } = useBoardDetail(id);
  const {
    data: itemsPages,
    isLoading: itemsLoading,
    isError: itemsError,
    error: itemsErr,
    refetch: refetchItems,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useItems(id);

  const items = useMemo(
    () => itemsPages?.pages.flatMap((page) => page.items) ?? [],
    [itemsPages],
  );

  const loadMoreRef = useIntersectionObserver(
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    { rootMargin: "320px", threshold: 0 },
  );
  const { data: activities = [] } = useBoardActivity(id);
  const { user } = useAuth();
  const { openSaveModal, openItemModal, openShareSheet } = useModalStore();
  const { collabPanelOpen, setCollabPanelOpen } = useUIStore();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const showCollab = useLazyMount(collabPanelOpen);
  const showSettings = useLazyMount(settingsOpen);
  const itemsSectionRef = useRef<HTMLElement>(null);
  const prevItemCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`board:${id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "items",
            filter: `board_id=eq.${id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: itemKeys.list(id) });
            queryClient.invalidateQueries({ queryKey: activityKeys.board(id) });
          },
        )
        .subscribe();
    } catch {
      // Realtime optional — ignore if unavailable
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  useEffect(() => {
    const count = items?.length ?? 0;
    if (prevItemCountRef.current !== null && count > prevItemCountRef.current) {
      requestAnimationFrame(() => {
        itemsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    prevItemCountRef.current = count;
  }, [items?.length]);

  const heroImages = useMemo(
    () => resolveHeroPreviewImages(items, board),
    [items, board],
  );

  if (boardLoading) {
    return <BoardDetailPageSkeleton />;
  }

  if (boardError) {
    return (
      <main className="page-container py-12">
        <ErrorAlert
          error={boardErr}
          title="Couldn't load this collection"
          onRetry={() => refetchBoard()}
        />
      </main>
    );
  }

  if (!board) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center">
        <p className="font-display text-xl text-on-surface-variant">
          This collection wasn&apos;t found or you don&apos;t have access.
        </p>
      </div>
    );
  }

  const canInvite = canManageBoardSettings(board, user?.id);
  const canEditItems = canEditBoardItems(board, user?.id);
  const previewUrls =
    heroImages.length > 0
      ? heroImages
      : (board.preview_images ?? (board.cover_url ? [board.cover_url] : []));

  const handleShare = () => {
    if (!board.is_public) {
      velvetToast.info("Make it public", "Open settings and set visibility to Public.");
      return;
    }
    if (!board.slug) {
      velvetToast.error("Migration needed", "Run migration 004 in Supabase (see /setup).");
      return;
    }
    openShareSheet({
      url: getPublicShareUrl("", board.slug),
      title: board.title,
      text: board.description ?? undefined,
      imageUrls: previewUrls.slice(0, 4),
      eyebrow: "Velvet collection",
    });
  };

  return (
    <>
      <CollectionCoverHero
        overlay={
          <CollectionCoverToolbar
            back={
              <PageBackButton
                href={ROUTES.home}
                label="Collections"
                className="border-white/40 bg-bg-elevated/90 shadow-md backdrop-blur-md"
              />
            }
            boardId={board.id}
            likeCount={board.like_count ?? 0}
            showLike={false}
            canLike={false}
            share={
              board.is_public && board.slug
                ? {
                    url: getPublicShareUrl("", board.slug),
                    title: board.title,
                    text: board.description ?? undefined,
                    imageUrls: previewUrls.slice(0, 4),
                  }
                : undefined
            }
            endSlot={
              !board.is_public || !board.slug ? (
                <IconButton label="Share collection" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </IconButton>
              ) : undefined
            }
          />
        }
        images={heroImages}
        itemCount={board.item_count ?? items?.length ?? 0}
        emptyVariant="own"
        title={board.title}
        description={board.description}
        badge={
          board.mood ? (
            <span className="inline-flex rounded-full bg-bg-elevated px-3 py-1 text-xs font-bold text-primary shadow-sm ring-1 ring-outline-variant/20">
              {getMoodEmoji(board.mood)}
            </span>
          ) : undefined
        }
        meta={
          <CollectionHeroStatsRow
            itemCount={board.item_count ?? items?.length ?? 0}
            likeCount={board.like_count ?? 0}
            boardId={board.id}
            showLike={false}
            collaboratorCount={board.members?.length ?? 0}
          />
        }
        actions={
          <CollectionBoardActions
            board={board}
            userId={user?.id}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        }
      />

      <section
        ref={itemsSectionRef}
        className="page-container mt-stack-lg scroll-mt-24 pb-28 md:scroll-mt-8 md:pb-24"
      >
        {itemsError && (
          <ErrorAlert
            className="mb-6"
            error={itemsErr}
            title="Couldn't load items"
            onRetry={() => refetchItems()}
          />
        )}
        {itemsLoading ? (
          <CollectionItemsGrid>
            <ItemCardSkeleton count={SKELETON_BOARD_ITEMS_COUNT} />
          </CollectionItemsGrid>
        ) : items && items.length > 0 ? (
          <CollectionItemsGrid
            header={
              <p className="mb-4 text-sm font-medium text-on-surface-variant">
                <span className="font-semibold text-on-surface">{items.length}</span>{" "}
                {items.length === 1 ? "save" : "saves"}
              </p>
            }
          >
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() =>
                  openItemModal(item.id, {
                    snapshot: item,
                    boardId: id,
                    canEdit: canEditItems,
                  })
                }
              />
            ))}
            {hasNextPage && (
              <div ref={loadMoreRef} className="col-span-full py-4">
                {isFetchingNextPage && <ItemCardSkeleton count={4} />}
              </div>
            )}
          </CollectionItemsGrid>
        ) : (
          <CollectionItemsGrid emptyState>
            <CollectionAddCard
              className="collection-grid-empty-card"
              onClick={() => openSaveModal(id)}
            />
          </CollectionItemsGrid>
        )}
      </section>

      {canEditItems && (
        <CollectionSaveFab onClick={() => openSaveModal(id)} />
      )}

      {showCollab ? (
        <CollabPanel
          open={collabPanelOpen}
          onClose={() => setCollabPanelOpen(false)}
          boardId={board.id}
          members={board.members ?? []}
          activities={activities}
          canManage={canInvite}
          ownerId={board.owner_id}
          isPublic={board.is_public}
        />
      ) : null}

      {canEditBoardMeta(board, user?.id) && showSettings ? (
        <BoardSettingsModal
          board={board}
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </>
  );
}
