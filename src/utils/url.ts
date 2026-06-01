import { detectSource } from "@/services/metadata/metadata.service";
import type { ItemSource } from "@/types/board.types";

export { detectSource };

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getSourceLabel(source: ItemSource | null): string {
  const labels: Record<ItemSource, string> = {
    instagram: "INSTAGRAM",
    youtube: "YOUTUBE",
    amazon: "AMAZON",
    pinterest: "PINTEREST",
    web: "WEB",
    upload: "VELVET",
  };
  return source ? labels[source] : "SAVED";
}
