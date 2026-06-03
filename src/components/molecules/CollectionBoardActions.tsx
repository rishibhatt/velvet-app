"use client";

import { useRouter } from "next/navigation";
import { Copy, Settings, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { AvatarStack } from "@/components/molecules/AvatarStack";
import {
  canManageBoardSettings,
  canEditBoardMeta,
} from "@/lib/board-permissions";
import { useCollectionCollaborationState } from "@/hooks/useCollectionCollaborationState";
import { useDuplicateBoard, useRequestCollaboration } from "@/queries/board/mutations";
import { useUIStore } from "@/store/ui.store";
import { velvetToast } from "@/lib/toast";
import { ROUTES } from "@/constants/routes";
import type { Board } from "@/types/board.types";

interface CollectionBoardActionsProps {
  board: Board;
  userId: string | undefined;
  onOpenSettings: () => void;
}

export function CollectionBoardActions({
  board,
  userId,
  onOpenSettings,
}: CollectionBoardActionsProps) {
  const router = useRouter();
  const { setCollabPanelOpen } = useUIStore();
  const duplicateBoard = useDuplicateBoard();
  const requestCollab = useRequestCollaboration(board.id);
  const { collabState, isOwner, isMember, canEdit } =
    useCollectionCollaborationState(board, userId);

  const canManage = canManageBoardSettings(board, userId);
  const canOpenSettings = canEditBoardMeta(board, userId);
  const canDuplicate = Boolean(userId) && !isOwner;

  const handleDuplicate = () => {
    if (!userId) {
      velvetToast.info("Sign in required", "Create an account to duplicate collections.");
      return;
    }
    duplicateBoard.mutate(board.id, {
      onSuccess: (copy) => {
        velvetToast.success("Collection duplicated", "A private copy was added to your workspace.");
        router.push(ROUTES.board(copy.id));
      },
    });
  };

  const handleRequestCollab = () => {
    if (!userId) {
      velvetToast.info("Sign in required", "Sign in to request collaboration.");
      return;
    }
    requestCollab.mutate(undefined, {
      onSuccess: () => {
        velvetToast.success(
          "Request sent",
          "The owner will get a notification to approve or decline.",
        );
      },
    });
  };

  if (isOwner) {
    return (
      <>
        {board.members && board.members.length > 0 && (
          <AvatarStack profiles={board.members.map((m) => m.profile)} max={3} />
        )}

        {canManage && (
          <Button
            variant="secondary"
            size="sm"
            icon={UserPlus}
            onClick={() => setCollabPanelOpen(true)}
          >
            Invite
          </Button>
        )}

        {canOpenSettings && (
          <IconButton label="Collection settings" onClick={onOpenSettings}>
            <Settings className="h-5 w-5" />
          </IconButton>
        )}
      </>
    );
  }

  return (
    <>
      {isMember && (
        <>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            {canEdit ? "You can edit this collection" : "You’re a collaborator"}
          </span>
          <Button
            variant="secondary"
            size="sm"
            icon={Users}
            onClick={() => setCollabPanelOpen(true)}
          >
            Collaborators
          </Button>
        </>
      )}

      {collabState === "invite_pending" && (
        <span className="text-xs font-semibold text-primary">
          Invite pending — check notifications
        </span>
      )}

      {collabState === "request_pending" && (
        <span className="text-xs font-semibold text-on-surface-variant">
          Request pending — check notifications
        </span>
      )}

      {collabState === "visitor" && userId && (
        <Button
          variant="secondary"
          size="sm"
          icon={Users}
          loading={requestCollab.isPending}
          onClick={() => void handleRequestCollab()}
        >
          Request collab
        </Button>
      )}

      {canDuplicate && (
        <Button
          variant="secondary"
          size="sm"
          icon={Copy}
          loading={duplicateBoard.isPending}
          onClick={() => void handleDuplicate()}
        >
          Duplicate
        </Button>
      )}

      {canOpenSettings && (
        <IconButton label="Collection settings" onClick={onOpenSettings}>
          <Settings className="h-5 w-5" />
        </IconButton>
      )}
    </>
  );
}
