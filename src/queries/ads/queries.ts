"use client";

import { useQuery } from "@tanstack/react-query";
import type { AdUnit } from "@/types/board.types";

async function fetchAds(placement: string, mood?: string | null) {
  const params = new URLSearchParams({ placement, limit: "3" });
  if (mood) params.set("mood", mood);
  const res = await fetch(`/api/ads/serve?${params}`);
  if (!res.ok) return { ads: [] as AdUnit[] };
  return res.json() as Promise<{ ads: AdUnit[] }>;
}

export function useAds(placement: string, mood?: string | null, enabled = true) {
  return useQuery({
    queryKey: ["ads", placement, mood ?? "all"],
    queryFn: () => fetchAds(placement, mood),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
