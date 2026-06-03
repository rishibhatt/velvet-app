import type { Metadata } from "next";
import { BRAND } from "@/constants/brand";
import { previewImagesFromItems } from "@/lib/collection-previews";
import { getAppBaseUrl } from "@/lib/app-url";
import { ROUTES } from "@/constants/routes";
import type { Board, Item } from "@/types/board.types";

function absoluteAsset(path: string): string {
  const base = getAppBaseUrl();
  if (!path.startsWith("http")) {
    return base ? `${base.replace(/\/$/, "")}${path}` : path;
  }
  return path;
}

function absoluteRoute(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = getAppBaseUrl().replace(/\/$/, "");
  return base ? `${base}${normalized}` : normalized;
}

function ogImagesFromUrls(
  urls: string[],
  alt: string,
): NonNullable<Metadata["openGraph"]>["images"] {
  const unique = [...new Set(urls.filter(Boolean))].slice(0, 4);
  if (unique.length === 0) return undefined;
  return unique.map((url) => ({
    url: absoluteAsset(url),
    width: 1200,
    height: 630,
    alt,
  }));
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
  const canonical = absoluteRoute(ROUTES.creator(profile.username));
  const ogImages = ogImagesFromUrls([image], name) ?? velvetBrandOgMetadata().openGraph?.images;
  const twitterImage = absoluteAsset(image);

  return {
    title: `${name}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${name} on ${BRAND.name}`,
      description,
      type: "profile",
      url: canonical,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} on ${BRAND.name}`,
      description,
      images: [twitterImage],
    },
  };
}

export function publicCollectionMetadata(
  board: Board,
  items: Item[],
  ownerName?: string | null,
): Metadata {
  const previews = previewImagesFromItems(items);
  const posterUrls = (
    previews.length > 0
      ? previews
      : (board.preview_images ?? (board.cover_url ? [board.cover_url] : []))
  ).slice(0, 4);
  const primaryPoster = posterUrls[0];
  const description =
    board.description ??
    `A curated ${BRAND.name} collection${ownerName ? ` by ${ownerName}` : ""}.`;
  const ogImages =
    ogImagesFromUrls(posterUrls, board.title) ??
    velvetBrandOgMetadata().openGraph?.images;
  const canonical = board.slug
    ? absoluteRoute(ROUTES.publicCollection(board.slug))
    : undefined;

  return {
    title: board.title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: board.title,
      description,
      type: "website",
      url: canonical,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: board.title,
      description,
      images: primaryPoster
        ? [absoluteAsset(primaryPoster)]
        : [absoluteAsset(BRAND.logo.og)],
    },
  };
}
