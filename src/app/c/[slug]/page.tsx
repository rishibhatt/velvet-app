import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { CollectionCoverHero } from "@/components/molecules/CollectionCoverHero";
import { getPublicCollectionBySlug } from "@/lib/public-collection";
import { getMoodEmoji } from "@/constants/moods";
import { PublicItemGrid } from "@/features/collections/components/PublicItemGrid";
import { PublicCollectionActions } from "@/features/collections/components/PublicCollectionActions";

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

  const { board, items, owner } = data;

  return (
    <div className="min-h-screen bg-background">
      <CollectionCoverHero
        size="public"
        coverUrl={board.cover_url}
        title={board.title}
        description={board.description}
        badge={
          <span className="inline-flex rounded-full bg-bg-elevated px-3 py-1 text-xs font-bold text-primary shadow-sm ring-1 ring-outline-variant/20">
            {getMoodEmoji(board.mood)} Public collection
          </span>
        }
        meta={
          owner ? (
            <p className="text-sm text-on-surface">
              Curated by{" "}
              <Link
                href={`/u/${owner.username}`}
                className="font-semibold text-primary hover:underline"
              >
                {owner.full_name ?? owner.username}
              </Link>
            </p>
          ) : null
        }
      />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <PublicCollectionActions board={board} ownerId={board.owner_id} />
        </div>
        {items.length > 0 ? (
          <PublicItemGrid items={items} />
        ) : (
          <p className="text-center text-on-surface-variant">
            This collection is waiting for its first save.
          </p>
        )}

        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-primary/20 bg-primary-fixed/30 p-10 text-center">
          <h2 className="font-display text-2xl text-on-surface">
            Love this collection?
          </h2>
          <p className="max-w-md text-on-surface-variant">
            Sign up for Velvet to save your own version and keep curating what
            matters to you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">Start your velvet world</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-outline-variant/20 py-8 text-center text-sm text-on-surface-variant">
        <Link href="/" className="font-display text-primary hover:underline">
          Velvet
        </Link>
        {" · "}Your velvet world.
      </footer>
    </div>
  );
}
