"use client";

import { useQuery } from "@tanstack/react-query";
import type { InsightsData, InsightsPeriod } from "@/types/board.types";

async function fetchInsights(period: InsightsPeriod) {
  const res = await fetch(`/api/insights?period=${period}`);
  if (!res.ok) throw new Error("Failed to load insights");
  return res.json() as Promise<InsightsData>;
}

export function useInsights(period: InsightsPeriod = "this_week") {
  return useQuery({
    queryKey: ["insights", period],
    queryFn: () => fetchInsights(period),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
