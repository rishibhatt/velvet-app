/** Wide map static previews look better in landscape aspect. */
export function isMapPreviewUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("maps.googleapis.com") ||
    url.includes("maps.google.com") ||
    url.includes("/staticmap")
  );
}

export function getPreviewAspectClass(url: string | null | undefined): string {
  return isMapPreviewUrl(url) ? "aspect-[16/10]" : "aspect-[4/5]";
}
