import type { Metadata } from "next";
import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { getMoodLabel } from "@/constants/moods";
import { generateCanonicalUrl } from "@/lib/seo/canonical";
import type { Board, Item, Mood, Profile } from "@/types/board.types";

const brandOg = BRAND.logo.og;

function fallbackDescription(title: string): string {
  return `Discover curated inspiration inside "${title}" on ${BRAND.name}.`;
}

function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "profile";
  robots?: Metadata["robots"];
}): Metadata {
  const canonical = generateCanonicalUrl(input.path);
  const image = input.image || brandOg;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: input.robots,
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: BRAND.name,
      type: input.type ?? "website",
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export function collectionMetadata(
  board: Board,
  items: Item[],
  owner: Pick<Profile, "username" | "full_name">,
): Metadata {
  return pageMetadata({
    title: `${board.title} | ${BRAND.name}`,
    description: board.description?.trim() || fallbackDescription(board.title),
    path: ROUTES.publicCollection(owner.username, board.slug ?? ""),
    image: board.cover_url ?? items.find((item) => item.image_url)?.image_url,
  });
}

export function profileMetadata(
  profile: Pick<Profile, "username" | "full_name" | "bio" | "avatar_url">,
): Metadata {
  const name = profile.full_name ?? profile.username;
  return pageMetadata({
    title: `${name} | ${BRAND.name}`,
    description:
      profile.bio?.trim() || `Explore public collections by @${profile.username} on ${BRAND.name}.`,
    path: ROUTES.creator(profile.username),
    image: profile.avatar_url,
    type: "profile",
  });
}

export function exploreMetadata(): Metadata {
  return pageMetadata({
    title: `Explore public collections | ${BRAND.name}`,
    description: `Discover trending moodboards and curated inspiration from the ${BRAND.name} community. Browse wedding, travel, fashion, and more — free to explore.`,
    path: ROUTES.explore,
  });
}

export function categoryMetadata(mood: Mood): Metadata {
  const label = getMoodLabel(mood);
  return pageMetadata({
    title: `${label} Collections | ${BRAND.name}`,
    description: `Explore top, trending, and newest ${label.toLowerCase()} collections curated on ${BRAND.name}.`,
    path: ROUTES.category(mood),
  });
}

export function tagMetadata(slug: string, tagName: string): Metadata {
  return pageMetadata({
    title: `${tagName} Collections | ${BRAND.name}`,
    description: `Explore ${tagName} inspiration, creators, and public collections on ${BRAND.name}.`,
    path: ROUTES.tag(slug),
  });
}

export function noIndexMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: false } };
}
