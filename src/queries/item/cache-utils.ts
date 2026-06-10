import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { itemKeys } from "@/queries/board/keys";
import type { Item } from "@/types/board.types";

export type ItemsPage = { items: Item[]; hasMore: boolean };

export function itemsListQueryKey(boardId: string) {
  return [...itemKeys.list(boardId), "paginated"] as const;
}

export function patchItemInBoardCache(
  queryClient: QueryClient,
  boardId: string,
  updated: Item,
) {
  queryClient.setQueryData<InfiniteData<ItemsPage>>(
    itemsListQueryKey(boardId),
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === updated.id ? updated : item,
          ),
        })),
      };
    },
  );
  queryClient.setQueryData(itemKeys.detail(updated.id), updated);
}

export function removeItemFromBoardCache(
  queryClient: QueryClient,
  boardId: string,
  itemId: string,
) {
  queryClient.setQueryData<InfiniteData<ItemsPage>>(
    itemsListQueryKey(boardId),
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.id !== itemId),
        })),
      };
    },
  );
}
