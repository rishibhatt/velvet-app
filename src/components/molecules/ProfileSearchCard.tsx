"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { ROUTES } from "@/constants/routes";
import type { Profile } from "@/types/board.types";

type ProfileResult = Pick<
  Profile,
  "id" | "username" | "full_name" | "avatar_url" | "bio"
>;

interface ProfileSearchCardProps {
  profile: ProfileResult;
}

export function ProfileSearchCard({ profile }: ProfileSearchCardProps) {
  const displayName = profile.full_name ?? profile.username;

  return (
    <Link
      href={ROUTES.creator(profile.username)}
      className="flex items-center gap-4 rounded-2xl border border-outline-variant/20 bg-bg-elevated p-4 transition-all active:scale-[0.99] hover:border-primary/30 hover:shadow-[var(--shadow-card)]"
    >
      <Avatar
        src={profile.avatar_url}
        name={displayName}
        size="md"
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-on-surface">{displayName}</p>
        <p className="truncate text-sm text-primary">@{profile.username}</p>
        {profile.bio && (
          <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
            {profile.bio}
          </p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant" />
    </Link>
  );
}
