"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/atoms/Button";
import { PageBackButton } from "@/components/molecules/PageBackButton";
import { CollectionCoverHero } from "@/components/molecules/CollectionCoverHero";
import { getMoodEmoji } from "@/constants/moods";
import { PublicItemGrid } from "@/features/collections/components/PublicItemGrid";
import { PublicCollectionActions } from "@/features/collections/components/PublicCollectionActions";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { likesService } from "@/services/likes/likes.service";
import { ROUTES } from "@/constants/routes";
import type { Board, Item } from "@/types/board.types";

interface PublicCollectionViewProps {
  board: Board;
  items: Item[];
  owner: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function PublicCollectionView({
  board: initialBoard,
  items,
  owner,
}: PublicCollectionViewProps) {
  const { isAuthenticated, isAuthReady, user } = useAuth();

  const { data: isLiked } = useQuery({
    queryKey: ["board-liked", initialBoard.id, user?.id],
    queryFn: async () => {
      const ids = await likesService.getLikedBoardIds([initialBoard.id]);
      return ids.has(initialBoard.id);
    },
    enabled: isAuthReady && isAuthenticated && Boolean(user?.id),
  });

  const board: Board =
    isLiked !== undefined
      ? { ...initialBoard, is_liked: isLiked }
      : initialBoard;

  return (
    <div className="min-h-screen bg-background">
      <CollectionCoverHero
        size="public"
        overlay={
          <PageBackButton
            href={ROUTES.explore}
            label="Explore"
            className="border-white/40 bg-bg-elevated/90 shadow-md backdrop-blur-md"
          />
        }
        coverUrl={board.cover_url}
        title={board.title}
        description={board.description}
        badge={
          <span className="inline-flex rounded-full bg-bg-elevated px-3 py-1 text-xs font-bold text-primary shadow-sm ring-1 ring-outline-variant/20">
            {getMoodEmoji(board.mood)} Public collection
          </span>
        }
        meta={
          owner ? (
            <p className="text-sm text-on-surface">
              Curated by{" "}
              <Link
                href={ROUTES.creator(owner.username)}
                className="font-semibold text-primary hover:underline"
              >
                {owner.full_name ?? owner.username}
              </Link>
            </p>
          ) : null
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <PublicCollectionActions board={board} ownerId={board.owner_id} />
        </div>

        {items.length > 0 ? (
          <PublicItemGrid
            items={items}
            curatorLabel={
              owner?.full_name ?? owner?.username ?? "Creator"
            }
          />
        ) : (
          <p className="text-center text-on-surface-variant">
            This collection is waiting for its first save.
          </p>
        )}

        {isAuthReady && !isAuthenticated && (
          <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-primary/20 bg-primary-fixed/30 p-8 text-center sm:p-10">
            <h2 className="font-display text-2xl text-on-surface">
              Love this collection?
            </h2>
            <p className="max-w-md text-on-surface-variant">
              Sign up for Velvet to save your own version and keep curating what
              matters to you.
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

      <footer className="border-t border-outline-variant/20 py-8 text-center text-sm text-on-surface-variant">
        <Link href={ROUTES.home} className="font-display text-primary hover:underline">
          Velvet
        </Link>
        {" · "}Your velvet world.
      </footer>
    </div>
  );
}
