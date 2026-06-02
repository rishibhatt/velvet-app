import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicCollectionView } from "@/features/collections/components/PublicCollectionView";
import { getPublicCollectionBySlug } from "@/lib/public-collection";
import { publicCollectionMetadata } from "@/lib/page-metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicCollectionBySlug(slug);
  if (!data) return { title: "Collection not found" };
  return publicCollectionMetadata(
    data.board,
    data.items,
    data.owner?.full_name ?? data.owner?.username,
  );
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
