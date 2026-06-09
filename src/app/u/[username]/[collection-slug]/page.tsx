import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import "@/app/collection-grid.css";
import { PublicCollectionView } from "@/features/collections/components/PublicCollectionView";
import { canEditBoardItems } from "@/lib/board-permissions";
import { getPublicCollectionByOwnerSlug } from "@/lib/public-collection";
import { collectionMetadata } from "@/lib/seo/metadata";
import { JsonLd, collectionSchemas } from "@/lib/seo/schema";
import { TrackOnMount } from "@/components/analytics/TrackOnMount";
import { ANALYTICS_EVENTS } from "@/lib/analytics";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/services/supabase/server";

interface PageProps {
  params: Promise<{ username: string; "collection-slug": string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, "collection-slug": slug } = await params;
  const data = await getPublicCollectionByOwnerSlug(username, slug);
  if (!data?.owner) return { title: "Collection not found" };
  return collectionMetadata(data.board, data.items, data.owner);
}

export default async function PublicCollectionPage({ params }: PageProps) {
  const { username, "collection-slug": slug } = await params;
  const data = await getPublicCollectionByOwnerSlug(username, slug);
  if (!data?.owner) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && canEditBoardItems(data.board, user.id)) {
    redirect(ROUTES.board(data.board.id));
  }

  return (
    <>
      <JsonLd data={collectionSchemas(data.board, data.items, data.owner, data.tags)} />
      <TrackOnMount
        event={ANALYTICS_EVENTS.COLLECTION_VIEWED}
        properties={{
          collection_id: data.board.id,
          creator_id: data.board.owner_id,
        }}
      />
      <PublicCollectionView
        board={data.board}
        items={data.items}
        owner={data.owner}
        tags={data.tags}
        moreFromCreator={data.moreFromCreator}
        relatedCollections={data.relatedCollections}
      />
    </>
  );
}
