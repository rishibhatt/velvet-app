"use client";

import { Bookmark, Heart, Settings, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { VelvetActionStatsBar } from "@/components/molecules/VelvetActionStatsBar";
import {
  canEditBoardMeta,
  canManageBoardSettings,
} from "@/lib/board-permissions";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/utils";
import type { Board } from "@/types/board.types";

interface CollectionOwnerToolbarProps {
  board: Board;
  userId: string | undefined;
  likeCount: number;
  saveCount: number;
  collaboratorCount: number;
  onOpenSettings: () => void;
  className?: string;
}

/** Owner / editor toolbar below the hero — matches public collaboration bar layout. */
export function CollectionOwnerToolbar({
  board,
  userId,
  likeCount,
  saveCount,
  collaboratorCount,
  onOpenSettings,
  className,
}: CollectionOwnerToolbarProps) {
  const { setCollabPanelOpen } = useUIStore();
  const canManage = canManageBoardSettings(board, userId);
  const canOpenSettings = canEditBoardMeta(board, userId);

  return (
    <VelvetActionStatsBar
      className={cn(className)}
      actions={
        <>
          {canManage ? (
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              className="w-full sm:w-auto"
              onClick={() => setCollabPanelOpen(true)}
            >
              Invite collaborator
            </Button>
          ) : null}
          {(board.members?.length ?? 0) > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              icon={Users}
              className="w-full sm:w-auto"
              onClick={() => setCollabPanelOpen(true)}
            >
              Collaborators
            </Button>
          ) : null}
          {canOpenSettings ? (
            <IconButton
              label="Collection settings"
              className="hidden h-10 w-10 shrink-0 rounded-full border-2 border-primary bg-bg-elevated text-primary shadow-sm sm:inline-flex"
              onClick={onOpenSettings}
            >
              <Settings className="h-4 w-4" />
            </IconButton>
          ) : null}
        </>
      }
      stats={[
        {
          icon: Bookmark,
          value: saveCount,
          label: saveCount === 1 ? "Save" : "Saves",
        },
        { icon: Heart, value: likeCount, label: "Likes" },
        { icon: Users, value: collaboratorCount, label: "Collaborators" },
      ]}
    />
  );
}
