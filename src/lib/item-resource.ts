import { ROUTES } from "@/constants/routes";
import { getClientAppBaseUrl } from "@/lib/app-url";
import { getItemSourceUrl } from "@/lib/item-source";
import type { Item } from "@/types/board.types";

type ResourceItem = Pick<
  Item,
  "id" | "board_id" | "type" | "source" | "source_url" | "image_url"
>;

/**
 * URL for “View resource” — external link when present; otherwise the Velvet
 * asset (uploaded image) or a deep link back to this save on the collection.
 */
export function getItemResourceUrl(item: ResourceItem): string | null {
  const external = getItemSourceUrl(item);
  if (external) return external;

  if (
    (item.type === "image" || item.source === "upload") &&
    item.image_url?.trim()
  ) {
    return item.image_url.trim();
  }

  if (item.board_id && item.id) {
    const base = getClientAppBaseUrl();
    const path = `${ROUTES.board(item.board_id)}?item=${item.id}`;
    return base ? `${base}${path}` : path;
  }

  return item.image_url?.trim() ?? null;
}

/** Best URL to share for this save. */
export function getItemShareUrl(item: ResourceItem): string {
  return (
    getItemResourceUrl(item) ??
    (typeof window !== "undefined" ? window.location.href : "")
  );
}
