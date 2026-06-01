"use client";

import { useQuery } from "@tanstack/react-query";
import { boardsService } from "@/services/boards/boards.service";
import { boardKeys } from "./keys";

export function useBoards() {
  return useQuery({
    queryKey: boardKeys.list(),
    queryFn: () => boardsService.getBoards(),
    meta: { skipErrorToast: true, errorContext: "board" },
  });
}

export function useBoardDetail(id: string) {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => boardsService.getBoardById(id),
    enabled: Boolean(id),
    meta: { skipErrorToast: true, errorContext: "board" },
  });
}

export function useLikedBoards() {
  return useQuery({
    queryKey: boardKeys.liked(),
    queryFn: () => boardsService.getLikedBoards(),
    meta: { skipErrorToast: true, errorContext: "board" },
  });
}

export function useBoardMembers(boardId: string) {
  return useQuery({
    queryKey: boardKeys.members(boardId),
    queryFn: () => boardsService.getBoardMembers(boardId),
    enabled: Boolean(boardId),
  });
}
