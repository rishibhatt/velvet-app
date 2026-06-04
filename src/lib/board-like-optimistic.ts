/** Shared in-flight like UI state (one optimistic snapshot per board, all components). */

type PendingLike = { isLiked: boolean; likeCount: number };

const pendingByBoard = new Map<string, PendingLike>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setPendingBoardLike(boardId: string, state: PendingLike | null) {
  if (state) pendingByBoard.set(boardId, state);
  else pendingByBoard.delete(boardId);
  emit();
}

export function getPendingBoardLike(boardId: string): PendingLike | null {
  return pendingByBoard.get(boardId) ?? null;
}

export function subscribePendingBoardLikes(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
