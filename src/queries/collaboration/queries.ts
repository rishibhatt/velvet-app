"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";
import { boardsService } from "@/services/boards/boards.service";
import { collabRequestKeys } from "./keys";
import type { BoardCollaborationRequest } from "@/types/board.types";

export function useMyCollaborationRequest(boardId: string, userId: string | undefined) {
  return useQuery({
    queryKey: collabRequestKeys.mine(boardId, userId ?? ""),
    queryFn: async () => {
      if (!userId) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("board_collaboration_requests")
        .select("id, board_id, requester_id, role, status, responded_at, created_at")
        .eq("board_id", boardId)
        .eq("requester_id", userId)
        .eq("status", "pending")
        .maybeSingle();

      if (error) throw error;
      return data as BoardCollaborationRequest | null;
    },
    enabled: Boolean(boardId && userId),
    meta: { skipErrorToast: true },
  });
}

export function usePendingCollaborationRequests(boardId: string, enabled: boolean) {
  return useQuery({
    queryKey: collabRequestKeys.pending(boardId),
    queryFn: () => boardsService.listPendingCollaborationRequests(boardId),
    enabled: Boolean(boardId) && enabled,
    meta: { skipErrorToast: true },
  });
}
