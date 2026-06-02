import type { Metadata } from "next";
import { BRAND } from "@/constants/brand";
import { previewImagesFromItems } from "@/lib/collection-previews";
import { getAppBaseUrl } from "@/lib/app-url";
import type { Board, Item } from "@/types/board.types";

function absoluteAsset(path: string): string {
  const base = getAppBaseUrl();
  if (!path.startsWith("http")) {
    return base ? `${base.replace(/\/$/, "")}${path}` : path;
  }
  return path;
}

function ogImages(url: string, alt: string): NonNullable<Metadata["openGraph"]>["images"] {
  return [{ url: absoluteAsset(url), width: 1200, height: 630, alt }];
}

/** Velvet brand default OG image */
export function velvetBrandOgMetadata(): Pick<Metadata, "openGraph" | "twitter"> {
  const image = absoluteAsset(BRAND.logo.og);
  return {
    openGraph: {
      images: [{ url: image, width: 1200, height: 630, alt: BRAND.name }],
    },
    twitter: {
      card: "summary_large_image",
      images: [image],
    },
  };
}

export function creatorProfileMetadata(profile: {
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}): Metadata {
  const name = profile.full_name ?? profile.username;
  const description =
    profile.bio ?? `Public collections by @${profile.username} on ${BRAND.name}.`;
  const image = profile.avatar_url?.trim()
    ? profile.avatar_url
    : BRAND.logo.og;

  return {
    title: `${name}`,
    description,
    openGraph: {
      title: `${name} on ${BRAND.name}`,
      description,
      type: "profile",
      images: ogImages(image, name),
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} on ${BRAND.name}`,
      description,
      images: [absoluteAsset(image)],
    },
  };
}

export function publicCollectionMetadata(
  board: Board,
  items: Item[],
  ownerName?: string | null,
): Metadata {
  const previews = previewImagesFromItems(items);
  const poster = previews[0] ?? board.preview_images?.[0] ?? board.cover_url;
  const description =
    board.description ??
    `A curated ${BRAND.name} collection${ownerName ? ` by ${ownerName}` : ""}.`;
  const images = poster ? ogImages(poster, board.title) : velvetBrandOgMetadata().openGraph?.images;

  return {
    title: board.title,
    description,
    openGraph: {
      title: board.title,
      description,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: board.title,
      description,
      images: poster ? [absoluteAsset(poster)] : [absoluteAsset(BRAND.logo.og)],
    },
  };
}
