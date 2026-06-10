"use client";

import { Users } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import {
  getBoardCollaboratorProfiles,
  hasMultipleCollaborators,
} from "@/lib/collaborators";
import type { Board } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface CollaboratorChipsProps {
  board: Board;
  className?: string;
}

/** Compact co-curate indicator on collection cards */
export function CollaboratorChips({ board, className }: CollaboratorChipsProps) {
  const profiles = getBoardCollaboratorProfiles(board);
  if (!hasMultipleCollaborators(board)) return null;

  const count = profiles.length;
  const names = profiles
    .map((p) => p.full_name ?? p.username)
    .filter(Boolean)
    .join(", ");
  const tip = names
    ? `Co-curated with ${names}`
    : `Co-curated with ${count} ${count === 1 ? "person" : "people"}`;

  return (
    <span
      className={cn(
        "inline-flex max-w-[min(100%,7.5rem)] items-center gap-1 rounded-full bg-bg-elevated/95 py-0.5 pr-1.5 pl-0.5 shadow-sm ring-1 ring-outline-variant/20 backdrop-blur-sm",
        className,
      )}
      title={tip}
      aria-label={tip}
    >
      <span className="flex -space-x-1.5" aria-hidden>
        {profiles.slice(0, 2).map((profile) => (
          <Avatar
            key={profile.id}
            src={profile.avatar_url}
            name={profile.full_name ?? profile.username}
            size="sm"
            className="!h-6 !w-6 ring-2 ring-bg-elevated"
          />
        ))}
        {count > 2 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-fixed text-[9px] font-bold text-primary ring-2 ring-bg-elevated">
            +{count - 2}
          </span>
        )}
      </span>
      <Users className="h-3 w-3 shrink-0 text-primary" aria-hidden />
    </span>
  );
}
