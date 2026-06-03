import { Navbar } from "@/components/organisms/Navbar";
import { PublicCollectionList } from "@/components/seo/PublicCollectionList";
import { getMoodLabel } from "@/constants/moods";
import type { Board, Mood } from "@/types/board.types";

export function CategoryPage({ mood, boards }: { mood: Mood; boards: Board[] }) {
  const label = getMoodLabel(mood);
  const top = [...boards].sort((a, b) => (b.item_count ?? 0) - (a.item_count ?? 0)).slice(0, 12);
  const newest = [...boards].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 12);
  const trending = [...boards].sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0)).slice(0, 12);

  return (
    <main className="min-h-screen bg-background pb-16">
      <Navbar />
      <div className="page-container py-10">
        <header className="mb-8">
          <h1 className="font-display text-3xl text-on-surface sm:text-4xl">{label} collections</h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Browse public {label.toLowerCase()} inspiration curated by Velvet creators.
          </p>
        </header>
        <Section title="Trending collections" boards={trending} />
        <Section title="Top collections" boards={top} />
        <Section title="Newest collections" boards={newest} />
      </div>
    </main>
  );
}

function Section({ title, boards }: { title: string; boards: Board[] }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 font-display text-xl text-on-surface">{title}</h2>
      <PublicCollectionList boards={boards} />
    </section>
  );
}
