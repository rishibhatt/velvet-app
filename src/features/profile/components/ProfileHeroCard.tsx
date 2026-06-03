"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  ExternalLink,
  Globe,
  Pencil,
  Settings,
} from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { ShareButton } from "@/components/molecules/ShareButton";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { ROUTES } from "@/constants/routes";
import { getCreatorProfileUrl } from "@/lib/app-url";
import { formatJoinedDate } from "@/utils/format";
import type { Profile } from "@/types/board.types";
import { cn } from "@/lib/utils";

interface ProfileHeroCardProps {
  profile: Profile;
  onEdit: () => void;
}

export function ProfileHeroCard({
  profile,
  onEdit,
}: ProfileHeroCardProps) {
  const displayName = profile.full_name ?? "Your profile";
  const websiteLabel = profile.website
    ? profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : null;

  const profileShareUrl = profile.username
    ? getCreatorProfileUrl(profile.username)
    : null;

  return (
    <section className="overflow-hidden rounded-3xl border border-outline-variant/25 bg-bg-elevated shadow-[var(--shadow-card)]">
      <div className="relative h-36 w-full sm:h-44 md:h-52">
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-elevated/80 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative px-4 pb-6 sm:px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-5 md:items-end">
            <div
              className={cn(
                "-mt-12 shrink-0 rounded-full bg-gradient-to-br from-[#9333ea] via-[#db2777] to-[#fb7185] p-[3px] shadow-md sm:-mt-14",
                "md:-mt-16",
              )}
            >
              <div className="rounded-full bg-bg-elevated p-[3px]">
                <Avatar
                  src={profile.avatar_url}
                  name={displayName}
                  size="xl"
                  className="!h-20 !w-20 ring-0 sm:!h-24 sm:!w-24 md:!h-28 md:!w-28"
                />
              </div>
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-display text-2xl text-on-surface sm:text-3xl md:text-[2rem] md:leading-tight">
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
                <p className="mt-0.5 text-sm font-medium text-on-surface-variant sm:text-base">
                  @{profile.username}
                </p>
              )}
              {profile.bio && (
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface sm:mx-0 sm:text-[15px]">
                  {profile.bio}
                </p>
              )}
              {(websiteLabel || profile.created_at) && (
                <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-on-surface-variant sm:justify-start sm:text-sm">
                  {websiteLabel && profile.website && (
                    <li className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
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
                      <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      <span>Joined {formatJoinedDate(profile.created_at)}</span>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[min(100%,320px)] md:shrink-0">
            {profile.username && (
              <Link href={ROUTES.creator(profile.username)} className="w-full">
                <Button
                  variant="gradient"
                  size="sm"
                  type="button"
                  icon={ExternalLink}
                  className="w-full shadow-md"
                >
                  View public page
                </Button>
              </Link>
            )}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                type="button"
                icon={Pencil}
                onClick={onEdit}
                className="w-full border-outline-variant/50 bg-bg-elevated"
              >
                Edit profile
              </Button>
              <Link href={ROUTES.settings} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  icon={Settings}
                  className="w-full border-outline-variant/50 bg-bg-elevated"
                >
                  Settings
                </Button>
              </Link>
              {profileShareUrl && (
                <ShareButton
                  url={profileShareUrl}
                  title={`${displayName} on Velvet`}
                  text={profile.bio ?? undefined}
                  imageUrl={profile.avatar_url ?? profile.banner_url}
                  eyebrow="Velvet profile"
                  preview
                  label="Share"
                  className="col-span-2 sm:col-span-1"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
