"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemsService } from "@/services/items/items.service";
import type { Item, SaveItemInput } from "@/types/board.types";
import { boardKeys, itemKeys } from "../board/keys";
import { getErrorMessage } from "@/lib/errors";
import { velvetToast } from "@/lib/toast";

export function useSaveItem(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveItemInput) => itemsService.saveItem(input),
    meta: { skipErrorToast: true, errorContext: "item" },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.list(boardId) });
      const previous = queryClient.getQueryData<Item[]>(
        itemKeys.list(boardId),
      );
      const optimistic: Item = {
        id: `temp-${Date.now()}`,
        board_id: boardId,
        user_id: "temp",
        type: newItem.type,
        source_url: newItem.sourceUrl ?? null,
        image_url: newItem.imageUrl ?? null,
        title: newItem.title ?? null,
        description: newItem.description ?? null,
        source: newItem.source ?? null,
        notes: newItem.notes ?? null,
        sort_order: 0,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Item[]>(itemKeys.list(boardId), (old) => [
        optimistic,
        ...(old ?? []),
      ]);
      return { previous };
    },
    onError: (err, _item, ctx) => {
      queryClient.setQueryData(itemKeys.list(boardId), ctx?.previous);
      velvetToast.error("Couldn't save item", getErrorMessage(err, "item"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
    },
  });
}

export function useDeleteItem(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => itemsService.deleteItem(itemId),
    meta: { errorContext: "item" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list(boardId) });
      velvetToast.success("Removed from collection");
    },
  });
}
