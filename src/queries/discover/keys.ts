import type { DiscoverFilters } from "@/services/discover/discover.service";

export const discoverKeys = {
  all: ["discover"] as const,
  publicBoards: (filters: DiscoverFilters) =>
    [...discoverKeys.all, "public-boards", filters] as const,
  profiles: (query: string) =>
    [...discoverKeys.all, "profiles", query] as const,
};
