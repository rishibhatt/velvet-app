"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  ExternalLink,
  Globe,
  Pencil,
  Settings,
  Share2,
} from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import {
  ProfileActionGroup,
  ProfileActionIconButton,
  ProfileActionItem,
  profileActionIconClass,
} from "@/components/molecules/ProfileActionGroup";
import { ROUTES } from "@/constants/routes";
import { getCreatorProfileUrl } from "@/lib/app-url";
import { useModalStore } from "@/store/modal.store";
import { formatJoinedDate } from "@/utils/format";
import type { Profile } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface ProfileHeroCardProps {
  profile: Profile;
  onEdit: () => void;
}

export function ProfileHeroCard({ profile, onEdit }: ProfileHeroCardProps) {
  const openShareSheet = useModalStore((s) => s.openShareSheet);
  const displayName = profile.full_name ?? "Your profile";
  const websiteLabel = profile.website
    ? profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : null;

  const profileShareUrl = profile.username
    ? getCreatorProfileUrl(profile.username)
    : null;

  const handleShare = () => {
    if (!profileShareUrl) return;
    openShareSheet({
      url: profileShareUrl,
      title: `${displayName} on Velvet`,
      text: profile.bio ?? undefined,
      imageUrl: profile.avatar_url ?? profile.banner_url,
      eyebrow: "Velvet profile",
    });
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-outline-variant/25 bg-bg-elevated shadow-[var(--shadow-card)]">
      <div className="relative h-36 w-full overflow-hidden rounded-t-3xl sm:h-44 md:h-48">
        {profile.banner_url ? (
          <VelvetImage
            src={profile.banner_url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-accent-blush via-accent-coral to-accent-lavender"
            aria-hidden
          />
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-elevated via-bg-elevated/20 to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative -mt-5 rounded-t-3xl bg-bg-elevated px-4 pb-5 pt-1 sm:-mt-6 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-5 lg:min-w-0 lg:flex-1">
            <div
              className={cn(
                "-mt-12 shrink-0 rounded-full bg-gradient-to-br from-[#9333ea] via-[#db2777] to-[#fb7185] p-[3px] shadow-md sm:-mt-14 lg:-mt-16",
              )}
            >
              <div className="rounded-full bg-bg-elevated p-[3px]">
                <Avatar
                  src={profile.avatar_url}
                  name={displayName}
                  size="xl"
                  className="!h-20 !w-20 ring-0 sm:!h-24 sm:!w-24 lg:!h-28 lg:!w-28"
                />
              </div>
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-display text-2xl text-on-surface sm:text-3xl">
                  {displayName}
                </h1>
                {profile.username && profile.full_name && (
                  <BadgeCheck
                    className="h-5 w-5 shrink-0 fill-primary-container text-primary"
                    aria-label="Profile complete"
                  />
                )}
              </div>
              {profile.username && (
                <p className="mt-0.5 text-sm font-medium text-on-surface-variant">
                  @{profile.username}
                </p>
              )}
              {profile.bio && (
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface sm:mx-0">
                  {profile.bio}
                </p>
              )}
              {(websiteLabel || profile.created_at) && (
                <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-on-surface-variant sm:justify-start">
                  {websiteLabel && profile.website && (
                    <li className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 opacity-70" aria-hidden />
                      <a
                        href={
                          profile.website.startsWith("http")
                            ? profile.website
                            : `https://${profile.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {websiteLabel}
                      </a>
                    </li>
                  )}
                  {profile.created_at && (
                    <li className="flex items-center gap-1">
                      {websiteLabel && (
                        <span className="text-outline-variant" aria-hidden>
                          •
                        </span>
                      )}
                      <Calendar className="h-3.5 w-3.5 opacity-70" aria-hidden />
                      <span>Joined {formatJoinedDate(profile.created_at)}</span>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="flex w-full shrink-0 justify-center lg:w-auto lg:justify-end">
            <ProfileActionGroup>
              {profile.username && (
                <ProfileActionItem label="Public page">
                  <Link
                    href={ROUTES.creator(profile.username)}
                    className={profileActionIconClass}
                    aria-label="View public page"
                  >
                    <ExternalLink className="h-4 w-4" strokeWidth={2.25} />
                  </Link>
                </ProfileActionItem>
              )}
              {profileShareUrl && (
                <ProfileActionItem label="Share">
                  <ProfileActionIconButton label="Share profile" onClick={handleShare}>
                    <Share2 className="h-4 w-4" strokeWidth={2.25} />
                  </ProfileActionIconButton>
                </ProfileActionItem>
              )}
              <ProfileActionItem label="Edit">
                <ProfileActionIconButton label="Edit profile" onClick={onEdit}>
                  <Pencil className="h-4 w-4" strokeWidth={2.25} />
                </ProfileActionIconButton>
              </ProfileActionItem>
              <ProfileActionItem label="Settings">
                <Link
                  href={ROUTES.settings}
                  className={profileActionIconClass}
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" strokeWidth={2.25} />
                </Link>
              </ProfileActionItem>
            </ProfileActionGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
