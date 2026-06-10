import { Eye, Flame, Heart, type LucideIcon } from "lucide-react";
import type { PublicBoardSort } from "@/services/discover/discover.service";

/** Sort options shown on the explore feed toolbar */
export const EXPLORE_SORT_OPTIONS: {
  value: PublicBoardSort;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "trending", label: "Trending", icon: Flame },
  { value: "most_liked", label: "Most liked", icon: Heart },
  { value: "most_viewed", label: "Most viewed", icon: Eye },
];

export const EXPLORE_SORT_VALUES = new Set(
  EXPLORE_SORT_OPTIONS.map((o) => o.value),
);
