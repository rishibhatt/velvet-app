"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/atoms/Button";
import { PageBackButton } from "@/components/molecules/PageBackButton";
import { CollectionCoverHero } from "@/components/molecules/CollectionCoverHero";
import { BoardLikeButton } from "@/components/molecules/BoardLikeButton";
import { ShareButton } from "@/components/molecules/ShareButton";
import { getMoodEmoji } from "@/constants/moods";
import { PublicItemGrid } from "@/features/collections/components/PublicItemGrid";
import { VelvetLogo } from "@/components/atoms/VelvetLogo";
import { Navbar } from "@/components/organisms/Navbar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { likesService } from "@/services/likes/likes.service";
import { ROUTES, getPublicShareUrl } from "@/constants/routes";
import { previewImagesFromItems } from "@/lib/collection-previews";
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

  const heroImages = previewImagesFromItems(items);
  const canLike =
    isAuthReady && isAuthenticated && user != null && user.id !== board.owner_id;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar />
      <CollectionCoverHero
        size="public"
        overlay={
          <>
            <PageBackButton
              href={ROUTES.explore}
              label="Explore"
              className="border-white/40 bg-bg-elevated/90 shadow-md backdrop-blur-md"
            />
            <div className="flex items-center gap-2">
              {board.slug && (
                <ShareButton
                  variant="icon"
                  url={getPublicShareUrl(board.slug)}
                  title={board.title}
                  text={board.description ?? undefined}
                  label="Share collection"
                />
              )}
              <BoardLikeButton
                boardId={board.id}
                likeCount={board.like_count ?? 0}
                isLiked={board.is_liked}
                canLike={canLike}
                appearance="toolbar"
              />
            </div>
          </>
        }
        images={heroImages}
        itemCount={board.item_count ?? items.length}
        emptyVariant="other"
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

      <main className="page-container py-stack-lg pb-28 md:pb-12">
        {items.length > 0 ? (
          <PublicItemGrid
            items={items}
            curatorLabel={
              owner?.full_name ?? owner?.username ?? "Creator"
            }
          />
        ) : (
          <p className="py-12 text-center text-on-surface-variant">
            This collection is waiting for its first save.
          </p>
        )}

        {isAuthReady && !isAuthenticated && (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-primary/20 bg-primary-fixed/30 p-6 text-center sm:mt-16 sm:p-10">
            <h2 className="font-display text-xl text-on-surface sm:text-2xl">
              Love this collection?
            </h2>
            <p className="max-w-md text-sm text-on-surface-variant sm:text-base">
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

      <footer className="flex flex-col items-center gap-3 border-t border-outline-variant/20 py-8 text-center text-sm text-on-surface-variant">
        <VelvetLogo variant="footer" href={ROUTES.home} />
        <p>Your velvet world.</p>
      </footer>
    </div>
  );
}
