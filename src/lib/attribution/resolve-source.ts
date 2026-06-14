import { TRAFFIC_SOURCE_PARAM } from "@/lib/attribution/constants";
import type { BoardViewSource } from "@/lib/attribution/types";

const VALID_SOURCES = new Set<BoardViewSource>([
  "explore",
  "direct",
  "share",
  "search",
  "category",
  "tag",
]);

const CAMPAIGN_TO_SOURCE: Record<string, BoardViewSource> = {
  explore: "explore",
  home: "explore",
  search: "search",
  tag: "tag",
  category: "category",
  collection: "share",
  profile: "share",
  item: "share",
  weekly_digest: "direct",
};

function toSearchParams(
  searchParams: URLSearchParams | { toString(): string; get(name: string): string | null } | string,
): URLSearchParams {
  if (typeof searchParams === "string") {
    const query = searchParams.startsWith("?") ? searchParams.slice(1) : searchParams;
    return new URLSearchParams(query);
  }
  return new URLSearchParams(searchParams.toString());
}

export function resolveTrafficSource(
  searchParams: URLSearchParams | { toString(): string; get(name: string): string | null } | string,
): BoardViewSource {
  const params = toSearchParams(searchParams);
  const src = params.get(TRAFFIC_SOURCE_PARAM)?.trim();
  if (src && VALID_SOURCES.has(src as BoardViewSource)) {
    return src as BoardViewSource;
  }

  const campaign = params.get("utm_campaign")?.trim();
  if (campaign && CAMPAIGN_TO_SOURCE[campaign]) {
    return CAMPAIGN_TO_SOURCE[campaign]!;
  }

  const medium = params.get("utm_medium")?.trim();
  if (medium === "share") return "share";
  if (medium === "internal") return "explore";

  return "direct";
}
