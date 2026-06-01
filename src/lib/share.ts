import { velvetToast } from "@/lib/toast";

export interface SharePayload {
  title?: string;
  text?: string;
  url: string;
}

/** Native share sheet when available; otherwise copy link to clipboard. */
export async function shareOrCopy(payload: SharePayload): Promise<boolean> {
  const { title, text, url } = payload;
  if (!url) {
    velvetToast.error("Nothing to share", "This item has no link yet.");
    return false;
  }

  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share({
        title: title ?? "Velvet",
        text,
        url,
      });
      return true;
    }

    await navigator.clipboard.writeText(url);
    velvetToast.success("Link copied!", "Paste it anywhere to share.");
    return true;
  } catch (err) {
    if ((err as Error).name === "AbortError") return false;
    try {
      await navigator.clipboard.writeText(url);
      velvetToast.success("Link copied!", "Paste it anywhere to share.");
      return true;
    } catch {
      velvetToast.error("Couldn't share", "Copy the link from View source instead.");
      return false;
    }
  }
}
