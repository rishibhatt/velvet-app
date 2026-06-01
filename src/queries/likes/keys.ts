export const likeKeys = {
  all: ["board-likes"] as const,
  board: (boardId: string) => ["board-likes", boardId] as const,
};
