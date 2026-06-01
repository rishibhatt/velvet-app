import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/atoms/Avatar";
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
    description: data.profile.bio ?? `Public collections by @${username} on Velvet.`,
  };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();

  const { profile, boards } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-6xl px-6 py-16 text-center">
        <Avatar
          src={profile.avatar_url}
          name={profile.full_name ?? profile.username}
          size="xl"
          className="mx-auto mb-6"
        />
        <h1 className="font-display text-3xl text-on-surface md:text-4xl">
          {profile.full_name ?? profile.username}
        </h1>
        <p className="mt-1 text-on-surface-variant">@{profile.username}</p>
        {profile.bio && (
          <p className="mx-auto mt-4 max-w-lg text-on-surface-variant">
            {profile.bio}
          </p>
        )}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            {profile.website}
          </a>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-display mb-8 text-2xl text-on-surface">
          Public collections
        </h2>
        {boards.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} publicHref={board.slug ? ROUTES.publicCollection(board.slug) : undefined} />
            ))}
          </div>
        ) : (
          <p className="text-center text-on-surface-variant">
            No public collections yet.
          </p>
        )}
      </main>
    </div>
  );
}
