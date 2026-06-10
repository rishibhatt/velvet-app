export interface RefreshMetadataResult {
  processed: number;
  updated: number;
  skipped: number;
  failed: number;
  remaining: number;
}

export async function refreshBoardLinkPreviews(
  boardId: string,
  options: { force?: boolean } = {},
): Promise<RefreshMetadataResult> {
  const response = await fetch("/api/items/refresh-metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      boardId,
      force: options.force ?? false,
    }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Could not refresh previews");
  }

  return response.json();
}
