export const boardKeys = {
  all: ["boards"] as const,
  list: () => [...boardKeys.all, "list"] as const,
  detail: (id: string) => [...boardKeys.all, "detail", id] as const,
  members: (id: string) => [...boardKeys.all, "members", id] as const,
};

export const itemKeys = {
  all: ["items"] as const,
  list: (boardId: string) => [...itemKeys.all, "list", boardId] as const,
  detail: (id: string) => [...itemKeys.all, "detail", id] as const,
};

export const commentKeys = {
  all: ["comments"] as const,
  list: (itemId: string) => [...commentKeys.all, "list", itemId] as const,
};
