import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { Button } from "@/components/atoms/Button";
import { getPublicCollectionBySlug } from "@/lib/public-collection";
import { getMoodEmoji } from "@/constants/moods";
import { PublicItemGrid } from "@/features/collections/components/PublicItemGrid";

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
      <header className="relative h-[320px] w-full overflow-hidden md:h-[400px]">
        {board.cover_url ? (
          <VelvetImage
            src={board.cover_url}
            alt=""
            fill
            className="object-cover blur-sm scale-110"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary-container/50 to-secondary-container/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-10">
          <span className="mb-3 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary">
            {getMoodEmoji(board.mood)} Public collection
          </span>
          <h1 className="font-display text-4xl text-on-surface md:text-5xl">
            {board.title}
          </h1>
          {board.description && (
            <p className="mt-3 max-w-2xl text-lg text-on-surface-variant">
              {board.description}
            </p>
          )}
          {owner && (
            <p className="mt-4 text-sm text-on-surface-variant">
              Curated by{" "}
              <Link
                href={`/u/${owner.username}`}
                className="font-semibold text-primary hover:underline"
              >
                {owner.full_name ?? owner.username}
              </Link>
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {items.length > 0 ? (
          <PublicItemGrid items={items} />
        ) : (
          <p className="text-center text-on-surface-variant">
            This collection is waiting for its first save.
          </p>
        )}

        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-10 text-center">
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
