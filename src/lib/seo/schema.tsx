import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { generateCanonicalUrl } from "@/lib/seo/canonical";
import type { Board, Item, Profile, Tag } from "@/types/board.types";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: generateCanonicalUrl(ROUTES.explore),
    logo: generateCanonicalUrl(BRAND.logo.icon512),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: generateCanonicalUrl(ROUTES.explore),
  };
}

export function profileSchema(profile: Profile, boardCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name ?? profile.username,
    url: generateCanonicalUrl(ROUTES.creator(profile.username)),
    image: profile.avatar_url ?? undefined,
    description: profile.bio ?? undefined,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/CreateAction",
      userInteractionCount: boardCount,
    },
  };
}

export function collectionSchemas(
  board: Board,
  items: Item[],
  owner: Pick<Profile, "username" | "full_name">,
  tags: Tag[],
) {
  const url = generateCanonicalUrl(ROUTES.publicCollection(owner.username, board.slug ?? ""));
  const name = owner.full_name ?? owner.username;
  return [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: board.title, url },
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: board.title,
      description: board.description ?? undefined,
      creator: { "@type": "Person", name },
      dateCreated: board.created_at,
      dateModified: board.updated_at,
      keywords: tags.map((tag) => tag.name).join(", ") || undefined,
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title ?? item.notes ?? `${board.title} save ${index + 1}`,
        url: item.source_url ?? url,
        image: item.image_url ?? undefined,
      })),
    },
  ];
}
