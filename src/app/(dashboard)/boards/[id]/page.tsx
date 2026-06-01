"use client";

import { use, useEffect, useRef, useState } from "react";
import { UserPlus, Share2, Plus, Users, Settings } from "lucide-react";
import { UI_LABELS } from "@/constants/ui-labels";
import { PageBackButton } from "@/components/molecules/PageBackButton";
import { ROUTES } from "@/constants/routes";
import { velvetToast } from "@/lib/toast";
import { ErrorAlert } from "@/components/molecules/ErrorAlert";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { AvatarStack } from "@/components/molecules/AvatarStack";
import { ItemCard, ItemCardSkeleton } from "@/components/organisms/ItemCard";
import { CollectionItemsGrid } from "@/components/organisms/CollectionItemsGrid";
import { CollabPanel } from "@/components/organisms/CollabPanel";
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
import type { ActivityLog } from "@/types/board.types";
import { BoardSettingsModal } from "@/features/boards/components/BoardSettingsModal";
import { CollectionCoverHero } from "@/components/molecules/CollectionCoverHero";
import { getPublicShareUrl } from "@/constants/routes";
import { BoardLikeButton } from "@/components/molecules/BoardLikeButton";
import { useAuth } from "@/features/auth/hooks/useAuth";

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
    data: items,
    isLoading: itemsLoading,
    isError: itemsError,
    error: itemsErr,
    refetch: refetchItems,
  } = useItems(id);
  const { data: activities = [] } = useBoardActivity(id);
  const { user } = useAuth();
  const { openSaveModal, openItemModal, openInviteModal } = useModalStore();
  const { collabPanelOpen, setCollabPanelOpen } = useUIStore();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  if (boardLoading) {
    return (
      <div className="pb-32">
        <div className="skeleton-shimmer h-[353px] w-full md:h-[442px]" />
        <div className="mx-auto max-w-7xl px-margin-mobile pt-stack-lg md:px-margin-desktop">
          <div className="masonry-grid">
            <ItemCardSkeleton />
          </div>
        </div>
      </div>
    );
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

  const members = board.members ?? [];
  const canInvite =
    user?.id === board.owner_id ||
    members.some((m) => m.user_id === user?.id && m.role === "admin");

  const handleShare = async () => {
    if (!board.is_public) {
      velvetToast.info("Make it public", "Open settings and set visibility to Public.");
      return;
    }
    if (!board.slug) {
      velvetToast.error("Migration needed", "Run migration 004 in Supabase (see /setup).");
      return;
    }
    try {
      await navigator.clipboard.writeText(getPublicShareUrl(board.slug));
      velvetToast.success("Link copied!");
    } catch {
      velvetToast.error("Couldn't copy link");
    }
  };

  return (
    <>
      <div className="mb-4">
        <PageBackButton href={ROUTES.home} label="Collections" />
      </div>
      <CollectionCoverHero
        coverUrl={board.cover_url}
        title={board.title}
        description={board.description}
        badge={
          <span className="inline-flex rounded-full bg-bg-elevated px-3 py-1 text-xs font-bold text-primary shadow-sm ring-1 ring-outline-variant/20">
            {getMoodEmoji(board.mood)} {board.item_count ?? items?.length ?? 0} items
          </span>
        }
        actions={
          <>
            {board.is_public && (
              <BoardLikeButton
                boardId={board.id}
                likeCount={board.like_count ?? 0}
                isLiked={board.is_liked}
                canLike={user != null && user.id !== board.owner_id}
                size="md"
              />
            )}
            <AvatarStack profiles={members.map((m) => m.profile)} max={3} />
            <Button
              variant="secondary"
              size="sm"
              icon={Users}
              onClick={() => setCollabPanelOpen(true)}
            >
              Collab
            </Button>
            {canInvite && (
              <Button
                variant="secondary"
                size="sm"
                icon={UserPlus}
                onClick={() => openInviteModal(board.id)}
              >
                Invite
              </Button>
            )}
            <IconButton label="Collection settings" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
            </IconButton>
            <IconButton label="Share board" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </IconButton>
          </>
        }
      />

      <section
        ref={itemsSectionRef}
        className="page-container mt-stack-lg scroll-mt-24 pb-[calc(9rem+env(safe-area-inset-bottom,0px))] md:scroll-mt-8 md:pb-32"
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
            <ItemCardSkeleton count={6} />
          </CollectionItemsGrid>
        ) : items && items.length > 0 ? (
          <CollectionItemsGrid
            header={
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl text-on-surface md:text-2xl">
                    Your saves
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {items.length} {items.length === 1 ? "item" : "items"} in this collection
                  </p>
                </div>
              </div>
            }
          >
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() =>
                  openItemModal(item.id, { snapshot: item, boardId: id })
                }
              />
            ))}
          </CollectionItemsGrid>
        ) : (
          <div className="rounded-3xl border border-dashed border-primary/30 bg-surface-container-low py-16 text-center">
            <p className="mb-4 text-on-surface-variant">
              No saves yet. Paste a link or image to start this collection.
            </p>
            <Button
              variant="gradient"
              icon={Plus}
              onClick={() => openSaveModal(id)}
            >
              {UI_LABELS.saveFirstItem}
            </Button>
          </div>
        )}
      </section>

      <div className="fixed bottom-[calc(3.25rem+env(safe-area-inset-bottom,0px))] left-0 z-40 flex w-full flex-col items-center md:bottom-0">
        <div className="flex min-h-[72px] w-full items-center justify-center border-t border-outline-variant/20 bg-bg-elevated/98 px-4 shadow-[0_-4px_24px_rgba(46,42,39,0.06)] sm:px-margin-mobile md:pb-safe">
          <Button
            size="lg"
            variant="gradient"
            icon={Plus}
            className="w-full max-w-md"
            onClick={() => openSaveModal(id)}
          >
            {UI_LABELS.saveToCollection}
          </Button>
        </div>
      </div>

      <CollabPanel
        open={collabPanelOpen}
        onClose={() => setCollabPanelOpen(false)}
        boardId={board.id}
        members={members}
        activities={activities as ActivityLog[]}
        canManage={canInvite}
        ownerId={board.owner_id}
      />

      <BoardSettingsModal
        board={board}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
