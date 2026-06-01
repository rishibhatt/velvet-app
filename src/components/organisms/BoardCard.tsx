"use client";

import Link from "next/link";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { motion } from "framer-motion";
import { ROUTES } from "@/constants/routes";
import { getMoodEmoji } from "@/constants/moods";
import type { Board } from "@/types/board.types";
import { AvatarStack } from "@/components/molecules/AvatarStack";

interface BoardCardProps {
  board: Board;
  /** Link to public page instead of private board detail */
  publicHref?: string;
}

export function BoardCard({ board, publicHref }: BoardCardProps) {
  const members =
    board.members?.map((m) => m.profile).filter(Boolean) ?? [];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={publicHref ?? ROUTES.board(board.id)}
        className="group relative block overflow-hidden rounded-3xl bg-surface-container-low shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-hover)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {board.cover_url ? (
            <VelvetImage
              src={board.cover_url}
              alt={board.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-surface-container" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute top-4 left-4 rounded-full bg-primary-container/30 px-3 py-1 text-xs font-semibold text-on-primary-container backdrop-blur-md">
            {getMoodEmoji(board.mood)} {board.mood}
          </div>

          {members.length > 0 && (
            <div className="absolute top-4 right-4">
              <AvatarStack profiles={members} max={2} />
            </div>
          )}

          <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between">
            <h4 className="font-display text-xl text-white md:text-2xl">
              {board.title}
            </h4>
            <div className="glass-panel rounded-full px-3 py-1 text-xs font-semibold text-primary">
              {board.item_count ?? 0} items
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function BoardCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl">
      <div className="aspect-[4/5] sm:aspect-[4/3]">
        <div className="skeleton-shimmer h-full w-full rounded-3xl" />
      </div>
    </div>
  );
}
