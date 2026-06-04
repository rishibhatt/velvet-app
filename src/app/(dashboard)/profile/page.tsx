"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ProfileBoardTab } from "@/features/profile/components/ProfileBoardTabs";
import { Skeleton } from "@/components/atoms/Skeleton";
import { CollectionCardSkeletonGrid } from "@/components/skeletons/CollectionCardSkeletonGrid";
import { ProfileEditor } from "@/features/profile/components/ProfileEditor";
import { ProfileBoardsSection } from "@/features/profile/components/ProfileBoardsSection";
import { ProfileHeroCard } from "@/features/profile/components/ProfileHeroCard";
import { ProfileStatsGrid } from "@/features/profile/components/ProfileStatsGrid";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useBoards, useLikedBoards } from "@/queries/board/queries";
import { CollectionCreateFab } from "@/components/molecules/CollectionCreateFab";
import { useModalStore } from "@/store/modal.store";

function ProfilePageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-5xl px-margin-mobile py-stack-lg md:px-margin-desktop md:py-12">
      <Skeleton className="h-[280px] w-full rounded-3xl sm:h-[320px]" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl sm:h-32" />
        ))}
      </div>
      <Skeleton className="mt-10 h-10 w-64 rounded-full" />
      <div className="mt-6">
        <CollectionCardSkeletonGrid count={4} />
      </div>
    </main>
  );
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { profile, isLoading: profileLoading } = useAuth();
  const { data: boards = [], isLoading: boardsLoading } = useBoards();
  const { data: likedBoards = [], isLoading: likedLoading } = useLikedBoards();
  const { openCreateBoard } = useModalStore();
  const [editing, setEditing] = useState(false);

  const initialTab: ProfileBoardTab =
    searchParams.get("tab") === "liked" ? "liked" : "yours";

  const stats = useMemo(() => {
    const totalItems = boards.reduce((acc, b) => acc + (b.item_count ?? 0), 0);
    const collaboratorIds = new Set<string>();
    for (const board of boards) {
      for (const member of board.members ?? []) {
        if (member.user_id && member.user_id !== profile?.id) {
          collaboratorIds.add(member.user_id);
        }
      }
    }
    const likesReceived = boards.reduce(
      (acc, b) => acc + (b.like_count ?? 0),
      0,
    );
    return {
      totalItems,
      collaborators: collaboratorIds.size,
      likesReceived,
    };
  }, [boards, profile?.id]);

  if (profileLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-5xl px-margin-mobile py-12 text-center text-on-surface-variant">
        Could not load your profile.
      </main>
    );
  }

  if (editing) {
    return (
      <main className="mx-auto w-full max-w-3xl px-margin-mobile py-stack-lg md:px-margin-desktop md:py-12">
        <h1 className="font-display mb-8 text-3xl text-on-surface">Edit profile</h1>
        <ProfileEditor
          profile={profile}
          onCancel={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-margin-mobile py-stack-lg md:px-margin-desktop md:py-12">
      <ProfileHeroCard
        profile={profile}
        onEdit={() => setEditing(true)}
      />

      <ProfileStatsGrid
        className="mt-6 sm:mt-8"
        boardsCount={boards.length}
        itemsCount={stats.totalItems}
        collaboratorsCount={stats.collaborators}
        likesReceived={stats.likesReceived}
      />

      <ProfileBoardsSection
        boards={boards}
        likedBoards={likedBoards}
        boardsLoading={boardsLoading}
        likedLoading={likedLoading}
        onCreateBoard={openCreateBoard}
        initialTab={initialTab}
      />

      <CollectionCreateFab onClick={openCreateBoard} />
    </main>
  );
}
