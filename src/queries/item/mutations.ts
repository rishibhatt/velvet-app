"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { previewImagesFromItems } from "@/lib/collection-previews";
import { itemsService } from "@/services/items/items.service";
import {
  refreshBoardLinkPreviews,
  type RefreshMetadataResult,
} from "@/services/metadata/refresh-metadata.service";
import type { Board, Item, SaveItemInput, UpdateItemInput } from "@/types/board.types";
import { boardKeys, itemKeys } from "../board/keys";
import {
  itemsListQueryKey,
  patchItemInBoardCache,
  removeItemFromBoardCache,
  type ItemsPage,
} from "@/queries/item/cache-utils";
import type { InfiniteData } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/errors";
import { velvetToast } from "@/lib/toast";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

function patchBoardInList(
  boards: Board[] | undefined,
  boardId: string,
  patch: Partial<Board>,
): Board[] | undefined {
  if (!boards) return boards;
  return boards.map((b) => (b.id === boardId ? { ...b, ...patch } : b));
}

export function useSaveItem(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveItemInput) => itemsService.saveItem(input),
    meta: { skipErrorToast: true, errorContext: "item" },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.list(boardId) });
      const previous = queryClient.getQueryData<InfiniteData<ItemsPage>>(
        itemsListQueryKey(boardId),
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
      queryClient.setQueryData<InfiniteData<ItemsPage>>(
        itemsListQueryKey(boardId),
        (old) => {
          if (!old?.pages.length) {
            return {
              pages: [{ items: [optimistic], hasMore: false }],
              pageParams: [0],
            };
          }
          const [first, ...rest] = old.pages;
          return {
            ...old,
            pages: [
              { ...first, items: [optimistic, ...first.items] },
              ...rest,
            ],
          };
        },
      );
      return { previous };
    },
    onError: (err, _item, ctx) => {
      queryClient.setQueryData(itemsListQueryKey(boardId), ctx?.previous);
      velvetToast.error("Couldn't save item", getErrorMessage(err, "item"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
    },
    onSuccess: (item) => {
      queryClient.setQueryData<InfiniteData<ItemsPage>>(
        itemsListQueryKey(boardId),
        (old) => {
          if (!old?.pages.length) return old;
          const [first, ...rest] = old.pages;
          const withoutTemp = first.items.filter((i) => !i.id.startsWith("temp-"));
          const withoutDup = withoutTemp.filter((i) => i.id !== item.id);
          return {
            ...old,
            pages: [{ ...first, items: [item, ...withoutDup] }, ...rest],
          };
        },
      );
      queryClient.setQueryData(itemKeys.detail(item.id), item);

      if (item.type === "image") {
        track(ANALYTICS_EVENTS.IMAGE_SAVED, {
          collection_id: boardId,
          item_id: item.id,
        });
      }
      if (item.type === "url" || item.type === "video") {
        track(ANALYTICS_EVENTS.LINK_SAVED, {
          collection_id: boardId,
          item_id: item.id,
          source: item.source,
        });
      }
    },
  });
}

export function useUpdateItem(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      ...input
    }: { itemId: string } & UpdateItemInput) =>
      itemsService.updateItem(itemId, input),
    meta: { skipErrorToast: true, errorContext: "item" },
    onSuccess: (updated) => {
      patchItemInBoardCache(queryClient, boardId, updated);
      velvetToast.success("Save updated", "Your changes were saved to this collection.");
    },
    onError: (err) => {
      velvetToast.error("Couldn't update", getErrorMessage(err, "item"));
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(variables.itemId),
      });
    },
  });
}

export function useRefreshItemPreviews(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (options: { force?: boolean } = {}) => {
      const totals: RefreshMetadataResult = {
        processed: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        remaining: 0,
      };

      for (let batch = 0; batch < 10; batch += 1) {
        const result = await refreshBoardLinkPreviews(boardId, options);
        totals.processed += result.processed;
        totals.updated += result.updated;
        totals.skipped = result.skipped;
        totals.failed += result.failed;
        totals.remaining = result.remaining;
        if (result.remaining === 0 || result.processed === 0) break;
      }

      return totals;
    },
    onSuccess: (result: RefreshMetadataResult) => {
      if (result.updated === 0 && result.remaining === 0) {
        velvetToast.info(
          "Nothing to refresh",
          "All link previews already look up to date.",
        );
        return;
      }

      velvetToast.success(
        "Previews refreshed",
        `Updated ${result.updated} save${result.updated === 1 ? "" : "s"}${
          result.remaining > 0 ? ` — ${result.remaining} still pending, tap again` : ""
        }.`,
      );
    },
    onError: (err) => {
      velvetToast.error("Refresh failed", getErrorMessage(err, "item"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}

export function useDeleteItem(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => itemsService.deleteItem(itemId),
    meta: { errorContext: "item" },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.list(boardId) });
      await queryClient.cancelQueries({ queryKey: boardKeys.list() });

      const previousItems = queryClient.getQueryData<InfiniteData<ItemsPage>>(
        itemsListQueryKey(boardId),
      );
      const previousBoards = queryClient.getQueryData<Board[]>(boardKeys.list());
      const previousDetail = queryClient.getQueryData<Board>(
        boardKeys.detail(boardId),
      );

      const remaining =
        previousItems?.pages.flatMap((page) => page.items).filter((i) => i.id !== itemId) ?? [];
      const preview_images = previewImagesFromItems(remaining);
      const cover_url = preview_images[0] ?? null;
      const item_count = remaining.length;

      removeItemFromBoardCache(queryClient, boardId, itemId);
      queryClient.setQueryData<Board[]>(boardKeys.list(), (old) =>
        patchBoardInList(old, boardId, {
          preview_images,
          cover_url,
          item_count,
        }),
      );
      queryClient.setQueryData<Board>(boardKeys.detail(boardId), (old) =>
        old
          ? { ...old, preview_images, cover_url, item_count }
          : old,
      );

      return { previousItems, previousBoards, previousDetail };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previousItems) {
        queryClient.setQueryData(itemsListQueryKey(boardId), ctx.previousItems);
      }
      if (ctx?.previousBoards) {
        queryClient.setQueryData(boardKeys.list(), ctx.previousBoards);
      }
      if (ctx?.previousDetail) {
        queryClient.setQueryData(boardKeys.detail(boardId), ctx.previousDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list(boardId) });
      queryClient.invalidateQueries({ queryKey: boardKeys.list() });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
    onSuccess: () => {
      velvetToast.success(
        "Removed from collection",
        "The save was deleted. You can add it again anytime.",
      );
    },
  });
}
