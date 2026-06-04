import type { QueryClient } from "@tanstack/react-query";
import { boardKeys } from "@/queries/board/keys";
import { discoverKeys } from "@/queries/discover/keys";
import { likeKeys } from "@/queries/likes/keys";
import type { Board } from "@/types/board.types";
import type { PublicBoard } from "@/services/discover/discover.service";

type BoardLikeSlice = Pick<Board, "id" | "is_liked" | "like_count">;

function patchBoard<T extends BoardLikeSlice>(
  board: T,
  liked: boolean,
  likeCount: number,
): T {
  return {
    ...board,
    is_liked: liked,
    like_count: likeCount,
  };
}

function patchBoardList<T extends BoardLikeSlice>(
  boards: T[] | undefined,
  boardId: string,
  liked: boolean,
  likeCount: number,
): T[] | undefined {
  if (!boards) return boards;
  return boards.map((b) =>
    b.id === boardId ? patchBoard(b, liked, likeCount) : b,
  );
}

function deriveLikeState(
  board: BoardLikeSlice,
  liked?: boolean,
  likeCount?: number,
) {
  const nextLiked = liked ?? !board.is_liked;
  const nextCount =
    likeCount ??
    Math.max(0, (board.like_count ?? 0) + (nextLiked === board.is_liked ? 0 : nextLiked ? 1 : -1));
  return { liked: nextLiked, likeCount: nextCount };
}

/** Apply optimistic/server like state everywhere this board appears in React Query. */
export function setBoardLikeAcrossCache(
  queryClient: QueryClient,
  boardId: string,
  liked: boolean,
  likeCount: number,
) {
  queryClient.setQueryData(likeKeys.status(boardId), liked);

  queryClient.setQueryData<Board>(boardKeys.detail(boardId), (old) =>
    old ? patchBoard(old, liked, likeCount) : old,
  );

  queryClient.setQueriesData<Board[]>(
    { queryKey: boardKeys.all },
    (old) => patchBoardList(old, boardId, liked, likeCount),
  );

  queryClient.setQueriesData<PublicBoard[]>(
    { queryKey: discoverKeys.all },
    (old) => patchBoardList(old, boardId, liked, likeCount),
  );
}

function findBoardLikeCount(
  queryClient: QueryClient,
  boardId: string,
): number {
  const detail = queryClient.getQueryData<Board>(boardKeys.detail(boardId));
  if (detail?.like_count != null) return detail.like_count;

  for (const [, data] of queryClient.getQueriesData<Board[] | PublicBoard[]>({
    queryKey: boardKeys.all,
  })) {
    const hit = data?.find((b) => b.id === boardId);
    if (hit?.like_count != null) return hit.like_count;
  }

  for (const [, data] of queryClient.getQueriesData<PublicBoard[]>({
    queryKey: discoverKeys.all,
  })) {
    const hit = data?.find((b) => b.id === boardId);
    if (hit?.like_count != null) return hit.like_count;
  }

  return 0;
}

export function applyOptimisticBoardLike(
  queryClient: QueryClient,
  boardId: string,
) {
  const detail = queryClient.getQueryData<Board>(boardKeys.detail(boardId));
  const discoverEntry = queryClient
    .getQueriesData<PublicBoard[]>({ queryKey: discoverKeys.all })
    .flatMap(([, data]) => data ?? [])
    .find((b) => b.id === boardId);

  const source = detail ?? discoverEntry;
  if (!source) {
    const currentLiked =
      queryClient.getQueryData<boolean>(likeKeys.status(boardId)) ?? false;
    const nextLiked = !currentLiked;
    const baseCount = findBoardLikeCount(queryClient, boardId);
    const nextCount = Math.max(0, baseCount + (nextLiked ? 1 : -1));
    setBoardLikeAcrossCache(queryClient, boardId, nextLiked, nextCount);
    return { liked: nextLiked, likeCount: nextCount };
  }

  const { liked, likeCount } = deriveLikeState(source);
  setBoardLikeAcrossCache(queryClient, boardId, liked, likeCount);
  return { liked, likeCount };
}

export function readBoardLikeFromCache(
  queryClient: QueryClient,
  boardId: string,
  fallback: { likeCount: number; isLiked: boolean },
) {
  const status = queryClient.getQueryData<boolean>(likeKeys.status(boardId));
  const detail = queryClient.getQueryData<Board>(boardKeys.detail(boardId));
  if (detail && detail.id === boardId) {
    return {
      likeCount: detail.like_count ?? fallback.likeCount,
      isLiked: detail.is_liked ?? fallback.isLiked,
    };
  }

  for (const [, data] of queryClient.getQueriesData<Board[] | PublicBoard[]>({
    queryKey: boardKeys.all,
  })) {
    const hit = data?.find((b) => b.id === boardId);
    if (hit) {
      return {
        likeCount: hit.like_count ?? fallback.likeCount,
        isLiked: hit.is_liked ?? fallback.isLiked,
      };
    }
  }

  for (const [, data] of queryClient.getQueriesData<PublicBoard[]>({
    queryKey: discoverKeys.all,
  })) {
    const hit = data?.find((b) => b.id === boardId);
    if (hit) {
      return {
        likeCount: hit.like_count ?? fallback.likeCount,
        isLiked: hit.is_liked ?? fallback.isLiked,
      };
    }
  }

  if (status !== undefined) {
    return {
      likeCount: fallback.likeCount,
      isLiked: status,
    };
  }

  return fallback;
}
