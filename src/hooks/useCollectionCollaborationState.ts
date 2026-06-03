"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBoardAccessRole, canEditBoardItems } from "@/lib/board-permissions";
import { createClient } from "@/services/supabase/client";
import { useMyCollaborationRequest } from "@/queries/collaboration/queries";
import type { Board } from "@/types/board.types";

export type CollabUiState =
  | "owner"
  | "collaborator"
  | "invite_pending"
  | "request_pending"
  | "visitor";

export function useCollectionCollaborationState(
  board: Board,
  userId: string | undefined,
) {
  const accessRole = getBoardAccessRole(board, userId);
  const { data: pendingInvite } = useQuery({
    queryKey: ["board-invite-pending", board.id, userId],
    queryFn: async () => {
      if (!userId) return null;
      const supabase = createClient();
      const { data } = await supabase
        .from("board_invitations")
        .select("id, status, role")
        .eq("board_id", board.id)
        .eq("invitee_id", userId)
        .eq("status", "pending")
        .maybeSingle();
      return data;
    },
    enabled: Boolean(userId) && board.owner_id !== userId,
  });

  const { data: pendingRequest } = useMyCollaborationRequest(board.id, userId);

  return useMemo(() => {
    const isOwner = accessRole === "owner";
    const isMember = accessRole != null && !isOwner;
    const canEdit = canEditBoardItems(board, userId);
    const collaboratorCount = board.members?.length ?? 0;

    let collabState: CollabUiState = "visitor";
    if (isOwner) collabState = "owner";
    else if (isMember) collabState = "collaborator";
    else if (pendingInvite) collabState = "invite_pending";
    else if (pendingRequest) collabState = "request_pending";

    return {
      accessRole,
      isOwner,
      isMember,
      canEdit,
      collaboratorCount,
      collabState,
      pendingInvite,
      pendingRequest,
    };
  }, [accessRole, board, pendingInvite, pendingRequest, userId]);
}
