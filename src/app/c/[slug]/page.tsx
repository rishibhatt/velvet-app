import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicCollectionView } from "@/features/collections/components/PublicCollectionView";
import { getPublicCollectionBySlug } from "@/lib/public-collection";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicCollectionBySlug(slug);
  if (!data) return { title: "Collection not found — Velvet" };
  return {
    title: `${data.board.title} — Velvet`,
    description:
      data.board.description ??
      `A curated Velvet collection by ${data.owner?.full_name ?? data.owner?.username ?? "a creator"}.`,
    openGraph: {
      title: data.board.title,
      description: data.board.description ?? undefined,
      images: data.board.cover_url ? [{ url: data.board.cover_url }] : [],
    },
  };
}

export default async function PublicCollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPublicCollectionBySlug(slug);
  if (!data) notFound();

  return (
    <PublicCollectionView
      board={data.board}
      items={data.items}
      owner={data.owner}
    />
  );
}
