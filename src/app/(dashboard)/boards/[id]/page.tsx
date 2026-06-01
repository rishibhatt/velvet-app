"use client";

import { use, useEffect, useState } from "react";
import { UserPlus, Share2, PlusCircle, Users, Settings } from "lucide-react";
import { velvetToast } from "@/lib/toast";
import { ErrorAlert } from "@/components/molecules/ErrorAlert";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { AvatarStack } from "@/components/molecules/AvatarStack";
import {
  ItemCard,
  ItemCardSkeleton,
} from "@/components/organisms/ItemCard";
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
import { getPublicShareUrl } from "@/constants/routes";

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
  const { openSaveModal, openItemModal } = useModalStore();
  const { collabPanelOpen, setCollabPanelOpen } = useUIStore();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      <section className="relative h-[min(50vh,320px)] w-full overflow-hidden sm:h-[380px] md:h-[442px]">
        {board.cover_url ? (
          <VelvetImage
            src={board.cover_url}
            alt=""
            fill
            className="scale-110 object-cover blur-sm"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary-container/40 to-secondary-container/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full px-4 pb-6 sm:px-margin-mobile sm:pb-stack-lg md:px-margin-desktop">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-white/50 bg-white/90 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-md">
                  {getMoodEmoji(board.mood)}{" "}
                  {board.item_count ?? items?.length ?? 0} Items
                </span>
              </div>
              <h1 className="font-display text-2xl leading-tight text-on-surface sm:text-3xl md:text-5xl">
                {board.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AvatarStack
                profiles={members.map((m) => m.profile)}
                max={3}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCollabPanelOpen(true)}
              >
                <Users className="h-4 w-4" />
                Collab
              </Button>
              <Button variant="secondary" size="sm">
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
              <IconButton label="Collection settings" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
              </IconButton>
              <IconButton label="Share board" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </IconButton>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container mt-stack-lg pb-36 md:pb-32">
        {itemsError && (
          <ErrorAlert
            className="mb-6"
            error={itemsErr}
            title="Couldn't load items"
            onRetry={() => refetchItems()}
          />
        )}
        {itemsLoading ? (
          <div className="masonry-grid">
            <ItemCardSkeleton />
          </div>
        ) : items && items.length > 0 ? (
          <div className="masonry-grid">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => openItemModal(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-primary/30 bg-white/60 py-16 text-center">
            <p className="mb-4 text-on-surface-variant">
              No saves yet. Paste a link or image to start your board.
            </p>
            <Button onClick={() => openSaveModal(id)}>
              <PlusCircle className="h-5 w-5" />
              Save your first item
            </Button>
          </div>
        )}
      </section>

      <div className="fixed bottom-16 left-0 z-50 flex w-full flex-col items-center pb-safe md:bottom-0">
        <div className="flex min-h-[72px] w-full items-center justify-center border-t border-white/40 bg-surface/95 px-4 backdrop-blur-xl sm:px-margin-mobile">
          <Button
            size="lg"
            variant="gradient"
            className="w-full max-w-md"
            onClick={() => openSaveModal(id)}
          >
            <PlusCircle className="h-5 w-5" />
            + Save Anything
          </Button>
        </div>
      </div>

      <CollabPanel
        open={collabPanelOpen}
        onClose={() => setCollabPanelOpen(false)}
        members={members}
        activities={activities as ActivityLog[]}
      />

      <BoardSettingsModal
        board={board}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
