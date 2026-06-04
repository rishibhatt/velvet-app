export const likeKeys = {
  all: ["board-likes"] as const,
  board: (boardId: string) => [...likeKeys.all, boardId] as const,
  status: (boardId: string) => [...likeKeys.all, "status", boardId] as const,
};
