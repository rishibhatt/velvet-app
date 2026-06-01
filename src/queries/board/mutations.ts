"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsService } from "@/services/boards/boards.service";
import type { CreateBoardInput } from "@/types/board.types";
import { boardKeys } from "./keys";
import { velvetToast } from "@/lib/toast";

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBoardInput) => boardsService.createBoard(input),
    meta: { errorContext: "board" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
    },
  });
}
