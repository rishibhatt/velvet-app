import type { MetadataRoute } from "next";
import { MOODS } from "@/constants/moods";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/services/supabase/server";
import { generateCanonicalUrl } from "@/lib/seo/canonical";
import { slugify } from "@/lib/slug";

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(path: string, priority: number, lastModified?: string): SitemapEntry {
  return {
    url: generateCanonicalUrl(path),
    priority,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
  };
}

export async function generateVelvetSitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: SitemapEntry[] = [
    entry("/", 1),
    entry(ROUTES.explore, 0.9),
    entry("/brands", 0.7),
    ...MOODS.filter((mood) => mood.value !== "other").map((mood) =>
      entry(ROUTES.category(mood.value), 0.8),
    ),
  ];

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .order("updated_at", { ascending: false })
    .limit(10000);

  urls.push(
    ...(profiles ?? []).map((profile) =>
      entry(ROUTES.creator(profile.username), 0.8, profile.updated_at),
    ),
  );

  const { data: boards } = await supabase
    .from("boards")
    .select("slug, updated_at, owner:profiles!owner_id(username)")
    .eq("is_public", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(50000);

  for (const row of boards ?? []) {
    const owner = row.owner as { username?: string } | null;
    if (row.slug && owner?.username) {
      urls.push(entry(ROUTES.publicCollection(owner.username, row.slug), 0.9, row.updated_at));
    }
  }

  const { data: tags } = await supabase.from("tags").select("name").limit(50000);
  const uniqueTags = [...new Set((tags ?? []).map((tag) => slugify(tag.name, "tag")))];
  urls.push(...uniqueTags.map((tag) => entry(ROUTES.tag(tag), 0.7)));

  return urls.slice(0, 100000);
}
