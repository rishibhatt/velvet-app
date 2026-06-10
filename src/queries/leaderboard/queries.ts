"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchLeaderboard(mood: string, limit = 10) {
  const res = await fetch(
    `/api/leaderboard?mood=${encodeURIComponent(mood)}&limit=${limit}`,
  );
  if (!res.ok) throw new Error("Failed to load leaderboard");
  return res.json() as Promise<{ entries: import("@/types/board.types").LeaderboardEntry[] }>;
}

export function useLeaderboard(mood: string, limit = 10) {
  return useQuery({
    queryKey: ["leaderboard", mood, limit],
    queryFn: () => fetchLeaderboard(mood, limit),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
}
