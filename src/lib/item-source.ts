import type { Item } from "@/types/board.types";

/** External URL users should open for a saved item. */
export function getItemSourceUrl(item: Pick<Item, "source_url" | "type">): string | null {
  if (item.type === "note") return null;
  const url = item.source_url?.trim();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    return null;
  }
  return null;
}
