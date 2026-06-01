"use client";

import { useQuery } from "@tanstack/react-query";
import { itemsService } from "@/services/items/items.service";
import { itemKeys } from "../board/keys";

export function useItems(boardId: string) {
  return useQuery({
    queryKey: itemKeys.list(boardId),
    queryFn: () => itemsService.getItems(boardId),
    enabled: Boolean(boardId),
    meta: { skipErrorToast: true, errorContext: "item" },
  });
}

export function useItemDetail(itemId: string) {
  return useQuery({
    queryKey: itemKeys.detail(itemId),
    queryFn: () => itemsService.getItemById(itemId),
    enabled: Boolean(itemId),
    meta: { skipErrorToast: true, errorContext: "item" },
  });
}
