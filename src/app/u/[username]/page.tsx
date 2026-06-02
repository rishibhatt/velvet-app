import type { Metadata } from "next";
import Link from "next/link";
import { VelvetLogo } from "@/components/atoms/VelvetLogo";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/atoms/Avatar";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { BoardCard } from "@/components/organisms/BoardCard";
import { getPublicProfile } from "@/lib/public-collection";
import { ROUTES } from "@/constants/routes";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) return { title: "Creator not found — Velvet" };
  return {
    title: `${data.profile.full_name ?? data.profile.username} — Velvet`,
    description:
      data.profile.bio ?? `Public collections by @${username} on Velvet.`,
  };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();

  const { profile, boards } = data;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="relative h-36 w-full overflow-hidden sm:h-48 md:h-56">
        {profile.banner_url ? (
          <VelvetImage
            src={profile.banner_url}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-r from-accent-blush via-accent-coral to-accent-lavender"
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"
          aria-hidden
        />
      </div>

      <header className="relative mx-auto max-w-6xl px-4 pt-0 pb-8 text-center sm:px-6">
        <div className="-mt-12 sm:-mt-14">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name ?? profile.username}
            size="xl"
            className="mx-auto mb-4 ring-4 ring-background shadow-md"
          />
        </div>
        <h1 className="font-display text-2xl text-on-surface sm:text-3xl md:text-4xl">
          {profile.full_name ?? profile.username}
        </h1>
        <p className="mt-1 text-on-surface-variant">@{profile.username}</p>
        {profile.bio && (
          <p className="mx-auto mt-4 max-w-lg text-sm text-on-surface-variant sm:text-base">
            {profile.bio}
          </p>
        )}
        {profile.website && (
          <a
            href={
              profile.website.startsWith("http")
                ? profile.website
                : `https://${profile.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        )}
        <p className="mt-4 text-sm font-medium text-on-surface-variant">
          {boards.length} public collection{boards.length === 1 ? "" : "s"}
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="font-display mb-6 text-xl text-on-surface sm:text-2xl">
          Public collections
        </h2>
        {boards.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                emptyVariant="other"
                publicHref={
                  board.slug ? ROUTES.publicCollection(board.slug) : undefined
                }
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-surface-container-low py-12 text-center text-on-surface-variant">
            No public collections yet.
          </p>
        )}

        <div className="mt-12 flex flex-col items-center gap-2 text-sm text-on-surface-variant">
          <span>Curated on</span>
          <VelvetLogo variant="footer" href={ROUTES.login} />
        </div>
      </main>
    </div>
  );
}
