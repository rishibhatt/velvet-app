"use client";

import { useQuery } from "@tanstack/react-query";
import {
  discoverService,
  type DiscoverFilters,
} from "@/services/discover/discover.service";
import { discoverKeys } from "./keys";

export function usePublicBoards(
  filters: DiscoverFilters,
  options?: { initialData?: Awaited<ReturnType<typeof discoverService.getPublicBoards>> },
) {
  return useQuery({
    queryKey: discoverKeys.publicBoards(filters),
    queryFn: () => discoverService.getPublicBoards(filters),
    initialData: options?.initialData,
    staleTime: options?.initialData ? 60_000 : 0,
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
