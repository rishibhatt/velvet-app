export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "collection";
}

export function uniqueSlug(base: string, suffix: string): string {
  const short = suffix.replace(/-/g, "").slice(0, 8);
  return `${base}-${short}`;
}
