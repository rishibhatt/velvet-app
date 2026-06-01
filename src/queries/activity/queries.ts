"use client";

import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/items/items.service";

export const activityKeys = {
  board: (boardId: string) => ["activity", boardId] as const,
};

export function useBoardActivity(boardId: string) {
  return useQuery({
    queryKey: activityKeys.board(boardId),
    queryFn: () => activityService.getBoardActivity(boardId),
    enabled: Boolean(boardId),
    meta: { skipErrorToast: true },
  });
}
