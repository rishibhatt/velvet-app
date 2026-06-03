"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { itemsService, ITEMS_PAGE_SIZE } from "@/services/items/items.service";
import { itemKeys } from "../board/keys";

export function useItems(boardId: string) {
  return useInfiniteQuery({
    queryKey: [...itemKeys.list(boardId), "paginated"],
    queryFn: ({ pageParam = 0 }) =>
      itemsService.getItems(boardId, { page: pageParam, limit: ITEMS_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled: Boolean(boardId),
    meta: { skipErrorToast: true, errorContext: "item" },
  });
}

export function useItemDetail(itemId: string) {
  return useQuery({
    queryKey: itemKeys.detail(itemId),
    queryFn: () => itemsService.getItemById(itemId),
    enabled: Boolean(itemId),
    staleTime: 0,
    meta: { skipErrorToast: true, errorContext: "item" },
  });
}
