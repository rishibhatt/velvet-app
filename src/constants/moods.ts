import type { LucideIcon } from "lucide-react";
import {
  Flower2,
  Gem,
  HeartHandshake,
  Lamp,
  LayoutGrid,
  PartyPopper,
  PenLine,
  Plane,
} from "lucide-react";

/** Preset collection moods — stored in boards.mood */
export const MOODS = [
  { value: "wedding" as const, label: "Wedding", emoji: "💒", Icon: HeartHandshake },
  { value: "travel" as const, label: "Travel", emoji: "✈️", Icon: Plane },
  { value: "home" as const, label: "Home", emoji: "🏠", Icon: Lamp },
  { value: "fashion" as const, label: "Fashion", emoji: "👗", Icon: Gem },
  { value: "events" as const, label: "Events", emoji: "🎉", Icon: PartyPopper },
  { value: "lifestyle" as const, label: "Lifestyle", emoji: "✨", Icon: Flower2 },
  { value: "other" as const, label: "Other", emoji: "📌", Icon: LayoutGrid },
] as const;

export const CUSTOM_MOOD_VALUE = "custom" as const;

export type MoodValue = (typeof MOODS)[number]["value"];

export function getMoodIcon(mood: string | null | undefined): LucideIcon {
  return MOODS.find((m) => m.value === mood)?.Icon ?? PenLine;
}

export function getMoodEmoji(mood: string | null | undefined): string {
  return MOODS.find((m) => m.value === mood)?.emoji ?? "✨";
}

export function getMoodLabel(mood: string | null | undefined): string {
  return MOODS.find((m) => m.value === mood)?.label ?? "Collection";
}

/** User-facing mood chip text (custom label wins). */
export function getMoodDisplayLabel(
  mood: string | null | undefined,
  moodLabel?: string | null,
): string {
  const custom = moodLabel?.trim();
  if (custom) return custom;
  return getMoodLabel(mood);
}
