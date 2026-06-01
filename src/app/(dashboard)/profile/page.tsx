"use client";

import { Avatar } from "@/components/atoms/Avatar";
import { BoardCard, BoardCardSkeleton } from "@/components/organisms/BoardCard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useBoards } from "@/queries/board/queries";
import { Skeleton } from "@/components/atoms/Skeleton";

export default function ProfilePage() {
  const { profile, isLoading: profileLoading } = useAuth();
  const { data: boards = [], isLoading: boardsLoading } = useBoards();

  const publicBoards = boards.filter((b) => b.is_public);
  const displayBoards = publicBoards.length > 0 ? publicBoards : boards;
  const totalItems = boards.reduce((acc, b) => acc + (b.item_count ?? 0), 0);
  const collabCount = boards.reduce(
    (acc, b) => acc + (b.members?.length ?? 0),
    0,
  );

  if (profileLoading) {
    return (
      <main className="page-container w-full max-w-5xl py-stack-lg md:py-12">
        <Skeleton className="mb-8 h-48 w-full rounded-3xl md:h-56" />
        <Skeleton className="mx-auto h-24 w-24 rounded-full" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-margin-mobile py-stack-lg md:px-margin-desktop md:py-12">
      {/* Cover */}
      <div
        className="h-40 w-full overflow-hidden rounded-3xl bg-gradient-to-r from-accent-blush via-accent-coral to-accent-lavender md:h-52"
        aria-hidden
      />

      {/* Profile header — constrained width, no stretch */}
      <div className="relative px-2 md:px-4">
        <div className="-mt-14 flex flex-col items-center gap-5 border-b border-outline-variant/20 pb-8 md:-mt-16 md:flex-row md:items-end md:gap-8">
          <div className="shrink-0">
            <Avatar
              src={profile?.avatar_url}
              name={profile?.full_name ?? profile?.username}
              size="lg"
              className="!h-24 !w-24 md:!h-28 md:!w-28 ring-4 ring-surface shadow-md"
            />
          </div>
          <div className="min-w-0 flex-1 text-center md:text-left">
            <h1 className="font-display truncate text-2xl text-on-surface md:text-3xl">
              {profile?.full_name ?? "Your Profile"}
            </h1>
            {profile?.username && (
              <p className="text-on-surface-variant">@{profile.username}</p>
            )}
            {profile?.bio && (
              <p className="mx-auto mt-3 max-w-prose text-on-surface-variant md:mx-0">
                {profile.bio}
              </p>
            )}
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3 md:max-w-none md:gap-6">
        {[
          { label: "Boards", value: boards.length },
          { label: "Items saved", value: totalItems },
          { label: "Collaborators", value: collabCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-outline-variant/25 bg-white px-4 py-5 text-center shadow-sm"
          >
            <p className="font-display text-2xl text-primary md:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-medium text-on-surface-variant md:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Boards */}
      <section className="mt-12">
        <h2 className="font-display mb-6 text-xl text-primary md:text-2xl">
          {publicBoards.length > 0 ? "Public Boards" : "Your Boards"}
        </h2>

        {boardsLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <BoardCardSkeleton key={i} />
            ))}
          </div>
        ) : displayBoards.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-surface-container-low py-12 text-center text-on-surface-variant">
            No boards yet. Create one from the home screen.
          </p>
        )}
      </section>
    </main>
  );
}
