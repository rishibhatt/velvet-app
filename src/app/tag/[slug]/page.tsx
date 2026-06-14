import type { Metadata } from "next";
import { Navbar } from "@/components/organisms/Navbar";
import { CreatorLinks, PublicCollectionList } from "@/components/seo/PublicCollectionList";
import { getTagPage } from "@/lib/public-collection";
import { tagMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTagPage(slug);
  return tagMetadata(slug, data.tagName);
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getTagPage(slug);
  return (
    <main className="min-h-screen bg-background pb-16">
      <Navbar />
      <div className="page-container py-10">
        <header className="mb-8">
          <h1 className="font-display text-3xl text-on-surface sm:text-4xl">#{data.tagName}</h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Public collections and creators using this Velvet tag.
          </p>
        </header>
        <PublicCollectionList
          boards={data.boards}
          trafficPreset="internal_tag"
          trafficContext={{ slug }}
        />
        <CreatorLinks boards={data.boards} />
      </div>
    </main>
  );
}
