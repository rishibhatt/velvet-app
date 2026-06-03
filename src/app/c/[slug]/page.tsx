import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPublicCollectionBySlug } from "@/lib/public-collection";
import { noIndexMetadata } from "@/lib/seo/metadata";
import { ROUTES } from "@/constants/routes";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicCollectionBySlug(slug);
  return noIndexMetadata(data?.board.title ?? "Collection not found");
}

export default async function PublicCollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPublicCollectionBySlug(slug);
  if (!data) notFound();
  if (!data.owner || !data.board.slug) notFound();
  redirect(ROUTES.publicCollection(data.owner.username, data.board.slug));
}
