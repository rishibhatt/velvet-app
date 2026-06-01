"use client";

import { useQuery } from "@tanstack/react-query";
import {
  discoverService,
  type DiscoverFilters,
} from "@/services/discover/discover.service";
import { discoverKeys } from "./keys";

export function usePublicBoards(filters: DiscoverFilters) {
  return useQuery({
    queryKey: discoverKeys.publicBoards(filters),
    queryFn: () => discoverService.getPublicBoards(filters),
    meta: { skipErrorToast: true, errorContext: "board" },
  });
}

export function useProfileSearch(query: string, enabled = true) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: discoverKeys.profiles(trimmed),
    queryFn: () => discoverService.searchProfiles(trimmed),
    enabled: enabled && trimmed.length >= 2,
    meta: { skipErrorToast: true },
  });
}
