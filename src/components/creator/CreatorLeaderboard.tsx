"use client";

import { ExploreLeaderboardSection } from "./ExploreLeaderboardSection";

/** @deprecated Use ExploreLeaderboardSection — kept for category/insights embeds */
export function CreatorLeaderboard({
  compact = false,
}: {
  defaultMood?: string;
  compact?: boolean;
}) {
  return <ExploreLeaderboardSection compact={compact} />;
}
