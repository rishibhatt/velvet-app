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
  {
    value: "wedding" as const,
    label: "Wedding",
    emoji: "💒",
    Icon: HeartHandshake,
    chipClass: "bg-sky-100 text-sky-600",
    chipSelectedClass: "bg-sky-200 text-sky-700 ring-sky-300/50",
  },
  {
    value: "travel" as const,
    label: "Travel",
    emoji: "✈️",
    Icon: Plane,
    chipClass: "bg-violet-100 text-violet-600",
    chipSelectedClass: "bg-violet-200 text-violet-700 ring-violet-300/50",
  },
  {
    value: "home" as const,
    label: "Home",
    emoji: "🏠",
    Icon: Lamp,
    chipClass: "bg-amber-100 text-amber-700",
    chipSelectedClass: "bg-amber-200 text-amber-800 ring-amber-300/50",
  },
  {
    value: "fashion" as const,
    label: "Fashion",
    emoji: "👗",
    Icon: Gem,
    chipClass: "bg-rose-100 text-rose-600",
    chipSelectedClass: "bg-rose-200 text-rose-700 ring-rose-300/50",
  },
  {
    value: "events" as const,
    label: "Events",
    emoji: "🎉",
    Icon: PartyPopper,
    chipClass: "bg-orange-100 text-orange-600",
    chipSelectedClass: "bg-orange-200 text-orange-700 ring-orange-300/50",
  },
  {
    value: "lifestyle" as const,
    label: "Lifestyle",
    emoji: "✨",
    Icon: Flower2,
    chipClass: "bg-yellow-100 text-yellow-700",
    chipSelectedClass: "bg-yellow-200 text-yellow-800 ring-yellow-300/50",
  },
  {
    value: "other" as const,
    label: "Other",
    emoji: "📌",
    Icon: PenLine,
    chipClass: "bg-slate-100 text-slate-600",
    chipSelectedClass: "bg-slate-200 text-slate-700 ring-slate-300/50",
  },
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
