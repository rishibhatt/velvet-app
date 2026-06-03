export const collabRequestKeys = {
  all: ["collab-requests"] as const,
  mine: (boardId: string, userId: string) =>
    [...collabRequestKeys.all, "mine", boardId, userId] as const,
  pending: (boardId: string) =>
    [...collabRequestKeys.all, "pending", boardId] as const,
};
