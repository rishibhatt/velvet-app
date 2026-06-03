import { getPublicCollectionByOwnerSlug } from "@/lib/public-collection";
import { collectionOgImage } from "@/lib/seo/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string; "collection-slug": string }>;
}) {
  const { username, "collection-slug": slug } = await params;
  const data = await getPublicCollectionByOwnerSlug(username, slug);
  return collectionOgImage({
    title: data?.board.title ?? "Velvet collection",
    creator: data?.owner?.full_name ?? data?.owner?.username ?? "Velvet",
    coverUrl: data?.board.cover_url ?? data?.items.find((item) => item.image_url)?.image_url,
  });
}
