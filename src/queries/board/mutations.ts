"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsService } from "@/services/boards/boards.service";
import type { BoardRole, CreateBoardInput } from "@/types/board.types";
import { activityKeys } from "@/queries/activity/queries";
import { boardKeys } from "./keys";
import { velvetToast } from "@/lib/toast";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBoardInput) => boardsService.createBoard(input),
    meta: { errorContext: "board" },
    onSuccess: (board, input) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
      track(ANALYTICS_EVENTS.COLLECTION_CREATED, {
        collection_id: board.id,
        collection_name: board.title,
        category: board.mood ?? input.mood,
        visibility: board.is_public ? "public" : "private",
      });
    },
  });
}

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof boardsService.updateBoard>[1]) =>
      boardsService.updateBoard(boardId, input),
    meta: { errorContext: "board" },
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
      queryClient.setQueryData(boardKeys.detail(boardId), board);
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => boardsService.deleteBoard(id),
    meta: { errorContext: "board" },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
      track(ANALYTICS_EVENTS.COLLECTION_DELETED, { collection_id: id });
    },
  });
}

export function useInviteMember(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { username: string; role: BoardRole }) =>
      boardsService.inviteMember(boardId, input.username, input.role),
    meta: { errorContext: "board" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.board(boardId) });
      velvetToast.success(
        "Invite sent",
        "They'll get a notification to accept or deny the collaboration.",
      );
    },
  });
}

export function useRemoveMember(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => boardsService.removeMember(boardId, memberId),
    meta: { errorContext: "board" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
      queryClient.invalidateQueries({ queryKey: activityKeys.board(boardId) });
      velvetToast.success("Collaborator removed");
    },
  });
}
