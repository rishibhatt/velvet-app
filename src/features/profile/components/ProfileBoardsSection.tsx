"use client";

import { useState } from "react";
import { FolderOpen, Heart, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { UI_LABELS } from "@/constants/ui-labels";
import {
  BoardCard,
  BoardCardSkeleton,
} from "@/components/organisms/BoardCard";
import { cn } from "@/lib/utils";
import type { Board } from "@/types/board.types";

type ProfileBoardTab = "yours" | "liked";

interface ProfileBoardsSectionProps {
  boards: Board[];
  likedBoards: Board[];
  boardsLoading: boolean;
  likedLoading: boolean;
  onCreateBoard: () => void;
}

function ProfileBoardsEmpty({
  tab,
  onCreateBoard,
}: {
  tab: ProfileBoardTab;
  onCreateBoard: () => void;
}) {
  const isLiked = tab === "liked";

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-outline-variant/35 bg-surface-container-low/60 px-6 py-12 text-center sm:px-10 sm:py-16">
      <svg
        viewBox="0 0 120 120"
        className="mb-6 h-20 w-20 opacity-90 sm:h-24 sm:w-24"
        aria-hidden
      >
        <rect x="20" y="30" width="50" height="40" rx="8" fill="#F4A896" opacity="0.35" />
        <rect x="45" y="20" width="50" height="40" rx="8" fill="#E8B4B8" opacity="0.45" />
        <rect x="35" y="50" width="50" height="40" rx="8" fill="#C9B6E4" opacity="0.35" />
        <circle cx="60" cy="88" r="6" fill="#f4a896" opacity="0.6" />
        <circle cx="48" cy="92" r="4" fill="#e8b4b8" opacity="0.5" />
        <circle cx="72" cy="90" r="5" fill="#c9b6e4" opacity="0.5" />
      </svg>
      <h3 className="font-display text-xl text-on-surface sm:text-2xl">
        {isLiked
          ? "No liked collections yet"
          : "You haven't created any collections yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant sm:text-base">
        {isLiked
          ? "Explore public collections and tap the heart to save inspiration here."
          : "Start by creating your first collection to save and organize your inspiration."}
      </p>
      {!isLiked && (
        <Button
          variant="gradient"
          size="lg"
          icon={Plus}
          className="mt-8 w-full max-w-xs shadow-lg sm:w-auto"
          onClick={onCreateBoard}
        >
          {UI_LABELS.createFirstCollection}
        </Button>
      )}
    </div>
  );
}

export function ProfileBoardsSection({
  boards,
  likedBoards,
  boardsLoading,
  likedLoading,
  onCreateBoard,
}: ProfileBoardsSectionProps) {
  const [tab, setTab] = useState<ProfileBoardTab>("yours");

  const activeBoards = tab === "yours" ? boards : likedBoards;
  const loading = tab === "yours" ? boardsLoading : likedLoading;

  const tabs: { id: ProfileBoardTab; label: string; icon: typeof FolderOpen }[] =
    [
      { id: "yours", label: UI_LABELS.yourCollections, icon: FolderOpen },
      { id: "liked", label: UI_LABELS.likedCollections, icon: Heart },
    ];

  return (
    <section className="mt-8 sm:mt-10">
      <div className="flex flex-col gap-4 border-b border-outline-variant/25 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="-mx-1 flex gap-1 overflow-x-auto pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Board collections"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-4 sm:text-base",
                tab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <Button
          variant="gradient"
          size="sm"
          type="button"
          icon={Plus}
          onClick={onCreateBoard}
          className="w-full shrink-0 shadow-md sm:w-auto"
        >
          {UI_LABELS.newCollection}
        </Button>
      </div>

      <div className="mt-6 sm:mt-8" role="tabpanel">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <BoardCardSkeleton key={i} />
            ))}
          </div>
        ) : activeBoards.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                showLike={tab === "liked"}
              />
            ))}
          </div>
        ) : (
          <ProfileBoardsEmpty tab={tab} onCreateBoard={onCreateBoard} />
        )}
      </div>
    </section>
  );
}
