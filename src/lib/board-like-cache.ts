import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { boardKeys } from "@/queries/board/keys";
import { discoverKeys } from "@/queries/discover/keys";
import { likeKeys } from "@/queries/likes/keys";
import type { Board } from "@/types/board.types";
import type { PublicBoard } from "@/services/discover/discover.service";

type BoardLikeSlice = Pick<Board, "id" | "is_liked" | "like_count">;

function isBoardLikeSlice(value: unknown): value is BoardLikeSlice {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as BoardLikeSlice).id === "string"
  );
}

function findBoardInQueryData(
  data: unknown,
  boardId: string,
): BoardLikeSlice | undefined {
  if (!Array.isArray(data)) return undefined;
  const hit = data.find((entry) => isBoardLikeSlice(entry) && entry.id === boardId);
  return hit;
}

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
  if (!Array.isArray(boards)) return boards;
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

function isPublicBoardsQueryKey(key: QueryKey): boolean {
  return key[0] === discoverKeys.all[0] && key[1] === "public-boards";
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

  queryClient.setQueryData<Board[]>(boardKeys.list(), (old) =>
    patchBoardList(old, boardId, liked, likeCount),
  );

  queryClient.setQueryData<Board[]>(boardKeys.liked(), (old) =>
    patchBoardList(old, boardId, liked, likeCount),
  );

  queryClient.setQueriesData<PublicBoard[]>(
    { queryKey: discoverKeys.all, predicate: (q) => isPublicBoardsQueryKey(q.queryKey) },
    (old) => patchBoardList(old, boardId, liked, likeCount),
  );
}

function findBoardLikeCount(
  queryClient: QueryClient,
  boardId: string,
): number {
  const detail = queryClient.getQueryData<Board>(boardKeys.detail(boardId));
  if (detail?.like_count != null) return detail.like_count;

  for (const [, data] of [
    [boardKeys.list(), queryClient.getQueryData(boardKeys.list())],
    [boardKeys.liked(), queryClient.getQueryData(boardKeys.liked())],
  ] as const) {
    const hit = findBoardInQueryData(data, boardId);
    if (hit?.like_count != null) return hit.like_count;
  }

  for (const [, data] of queryClient.getQueriesData<PublicBoard[]>({
    queryKey: discoverKeys.all,
    predicate: (q) => isPublicBoardsQueryKey(q.queryKey),
  })) {
    const hit = findBoardInQueryData(data, boardId);
    if (hit?.like_count != null) return hit.like_count;
  }

  return 0;
}

export function applyOptimisticBoardLike(
  queryClient: QueryClient,
  boardId: string,
) {
  const detail = queryClient.getQueryData<Board>(boardKeys.detail(boardId));

  let discoverEntry: BoardLikeSlice | undefined;
  for (const [, data] of queryClient.getQueriesData<PublicBoard[]>({
    queryKey: discoverKeys.all,
    predicate: (q) => isPublicBoardsQueryKey(q.queryKey),
  })) {
    discoverEntry = findBoardInQueryData(data, boardId);
    if (discoverEntry) break;
  }

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

  for (const data of [
    queryClient.getQueryData(boardKeys.list()),
    queryClient.getQueryData(boardKeys.liked()),
  ]) {
    const hit = findBoardInQueryData(data, boardId);
    if (hit) {
      return {
        likeCount: hit.like_count ?? fallback.likeCount,
        isLiked: hit.is_liked ?? fallback.isLiked,
      };
    }
  }

  for (const [, data] of queryClient.getQueriesData<PublicBoard[]>({
    queryKey: discoverKeys.all,
    predicate: (q) => isPublicBoardsQueryKey(q.queryKey),
  })) {
    const hit = findBoardInQueryData(data, boardId);
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
