import type { Board, BoardMember, BoardRole } from "@/types/board.types";

export type BoardAccessRole = "owner" | BoardRole;

export function getBoardAccessRole(
  board: Board,
  userId: string | undefined,
): BoardAccessRole | null {
  if (!userId) return null;
  if (board.owner_id === userId) return "owner";
  const member = board.members?.find((m) => m.user_id === userId);
  return member?.role ?? null;
}

export function canEditBoardMeta(
  board: Board,
  userId: string | undefined,
): boolean {
  const role = getBoardAccessRole(board, userId);
  return role === "owner" || role === "admin" || role === "editor";
}

/** Visibility, delete, slug — owner or board admin only. */
export function canManageBoardSettings(
  board: Board,
  userId: string | undefined,
): boolean {
  const role = getBoardAccessRole(board, userId);
  return role === "owner" || role === "admin";
}

export function canEditBoardItems(
  board: Board,
  userId: string | undefined,
): boolean {
  return canEditBoardMeta(board, userId);
}

export function canDeleteBoard(
  board: Board,
  userId: string | undefined,
): boolean {
  return board.owner_id === userId;
}

export function formatAccessRole(role: BoardAccessRole | null): string {
  if (!role) return "Guest";
  if (role === "owner") return "Owner";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function memberForUser(
  members: BoardMember[] | undefined,
  userId: string,
): BoardMember | undefined {
  return members?.find((m) => m.user_id === userId);
}
