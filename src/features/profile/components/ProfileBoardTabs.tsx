"use client";

import { Heart, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileBoardTab = "yours" | "liked";

interface ProfileBoardTabsProps {
  value: ProfileBoardTab;
  onChange: (tab: ProfileBoardTab) => void;
}

const tabs: { id: ProfileBoardTab; label: string; icon: typeof Layers }[] = [
  { id: "yours", label: "Yours", icon: Layers },
  { id: "liked", label: "Liked", icon: Heart },
];

export function ProfileBoardTabs({ value, onChange }: ProfileBoardTabsProps) {
  return (
    <div
      className="flex gap-6 border-b border-outline-variant/25"
      role="tablist"
      aria-label="Your collections"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative -mb-px flex items-center gap-2 pb-3 text-sm font-semibold transition-colors",
              active
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} aria-hidden />
            {tab.label}
            {active && (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
