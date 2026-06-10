export function slugify(title: string, fallback = "collection"): string {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || fallback;
}

export function slugifyTitle(title: string): string {
  return slugify(title, "collection");
}

export function uniqueSlug(base: string, suffix: string): string {
  const short = suffix.replace(/-/g, "").slice(0, 8);
  return `${base}-${short}`;
}

export function incrementSlug(base: string, index: number): string {
  return index <= 1 ? base : `${base}-${index}`;
}

/** Strips migration-004 style `title-abc12def` suffixes for display / regen. */
export function stripLegacySlugSuffix(slug: string): string {
  const cleaned = slug.replace(/-[0-9a-f]{8}$/i, "");
  return cleaned || slug;
}

export function isLegacyUuidSlugSuffix(slug: string): boolean {
  return /-[0-9a-f]{8}$/i.test(slug);
}
