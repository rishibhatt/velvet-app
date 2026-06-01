export const MOODS = [
  { value: "wedding" as const, label: "Wedding", emoji: "💒" },
  { value: "travel" as const, label: "Travel", emoji: "✈️" },
  { value: "home" as const, label: "Home", emoji: "🏠" },
  { value: "fashion" as const, label: "Fashion", emoji: "👗" },
  { value: "events" as const, label: "Events", emoji: "🎉" },
  { value: "lifestyle" as const, label: "Lifestyle", emoji: "✨" },
  { value: "other" as const, label: "Other", emoji: "📌" },
] as const;

export function getMoodEmoji(mood: string | null | undefined): string {
  return MOODS.find((m) => m.value === mood)?.emoji ?? "📌";
}

export function getMoodLabel(mood: string | null | undefined): string {
  return MOODS.find((m) => m.value === mood)?.label ?? "Other";
}
