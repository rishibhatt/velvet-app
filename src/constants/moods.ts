import type { LucideIcon } from "lucide-react";
import {
  CalendarHeart,
  Compass,
  Home,
  LayoutGrid,
  Palette,
  Sparkles,
  Shirt,
} from "lucide-react";

export const MOODS = [
  { value: "wedding" as const, label: "Wedding", emoji: "💒", Icon: CalendarHeart },
  { value: "travel" as const, label: "Travel", emoji: "✈️", Icon: Compass },
  { value: "home" as const, label: "Home", emoji: "🏠", Icon: Home },
  { value: "fashion" as const, label: "Fashion", emoji: "👗", Icon: Shirt },
  { value: "events" as const, label: "Events", emoji: "🎉", Icon: Sparkles },
  { value: "lifestyle" as const, label: "Lifestyle", emoji: "✨", Icon: Palette },
  { value: "other" as const, label: "Other", emoji: "📌", Icon: LayoutGrid },
] as const;

export type MoodValue = (typeof MOODS)[number]["value"];

export function getMoodIcon(mood: string | null | undefined): LucideIcon {
  return MOODS.find((m) => m.value === mood)?.Icon ?? LayoutGrid;
}

export function getMoodEmoji(mood: string | null | undefined): string {
  return MOODS.find((m) => m.value === mood)?.emoji ?? "📌";
}

export function getMoodLabel(mood: string | null | undefined): string {
  return MOODS.find((m) => m.value === mood)?.label ?? "Other";
}
