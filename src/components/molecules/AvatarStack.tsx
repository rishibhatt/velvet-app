import { Avatar } from "@/components/atoms/Avatar";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/board.types";

interface AvatarStackProps {
  profiles?: (Profile | undefined)[];
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function AvatarStack({
  profiles = [],
  max = 3,
  size = "sm",
  className,
}: AvatarStackProps) {
  const visible = profiles.filter(Boolean).slice(0, max) as Profile[];
  const remaining = Math.max(profiles.length - max, 0);

  if (visible.length === 0) return null;

  return (
    <div className={cn("flex -space-x-3", className)}>
      {visible.map((profile) => (
        <Avatar
          key={profile.id}
          src={profile.avatar_url}
          name={profile.full_name ?? profile.username}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container ring-2 ring-surface",
            size === "sm" ? "h-8 w-8" : "h-10 w-10",
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
