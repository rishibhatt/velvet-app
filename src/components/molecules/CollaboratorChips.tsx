"use client";

import { Users } from "lucide-react";
import { AvatarStack } from "@/components/molecules/AvatarStack";
import { getBoardCollaboratorProfiles, hasMultipleCollaborators } from "@/lib/collaborators";
import type { Board } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface CollaboratorChipsProps {
  board: Board;
  className?: string;
  /** Show "Shared" label beside avatars */
  showLabel?: boolean;
}

export function CollaboratorChips({
  board,
  className,
  showLabel = true,
}: CollaboratorChipsProps) {
  const profiles = getBoardCollaboratorProfiles(board);
  if (!hasMultipleCollaborators(board)) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/95 px-2 py-1 shadow-sm ring-1 ring-outline-variant/15 backdrop-blur-sm",
        className,
      )}
      title={`${profiles.length} collaborators`}
    >
      <AvatarStack profiles={profiles} max={3} size="sm" className="!-space-x-2" />
      {showLabel && (
        <span className="flex items-center gap-0.5 pr-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
          <Users className="h-3 w-3" aria-hidden />
          Shared
        </span>
      )}
    </span>
  );
}
