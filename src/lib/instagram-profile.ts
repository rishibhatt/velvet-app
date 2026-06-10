const INSTAGRAM_RESERVED_PATHS = new Set([
  "p",
  "reel",
  "reels",
  "stories",
  "tv",
  "explore",
  "accounts",
  "direct",
  "about",
  "legal",
  "developer",
  "privacy",
  "terms",
  "nametag",
  "popular",
  "web",
]);

/** Username from `instagram.com/{username}` (not posts, reels, or system paths). */
export function extractInstagramUsername(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (!host.includes("instagram.com")) return null;

    const [first] = parsed.pathname.split("/").filter(Boolean);
    if (!first || INSTAGRAM_RESERVED_PATHS.has(first.toLowerCase())) return null;

    return decodeURIComponent(first);
  } catch {
    return null;
  }
}

export function isInstagramProfileUrl(url: string): boolean {
  return extractInstagramUsername(url) !== null;
}

/** Turn IG og titles into a clean display name or @handle. */
export function formatInstagramProfileTitle(
  rawTitle: string | null | undefined,
  username: string,
): string {
  if (!rawTitle?.trim()) return `@${username}`;

  const title = rawTitle.trim();

  const withParens = title.match(/^(.+?)\s*\(@([a-zA-Z0-9._]+)\)/);
  if (withParens) {
    const name = withParens[1].trim();
    if (name && !/^instagram$/i.test(name)) return name;
    return `@${withParens[2]}`;
  }

  const atHandle = title.match(/^@?([a-zA-Z0-9._]+)\s*(?:[•·|,-]\s*)?Instagram/i);
  if (atHandle) return `@${atHandle[1]}`;

  const cleaned = title
    .replace(/\s*[•·|]\s*Instagram.*$/i, "")
    .replace(/\s+on Instagram.*$/i, "")
    .replace(/\s*•\s*Instagram photos and videos.*$/i, "")
    .trim();

  if (cleaned && !/^instagram$/i.test(cleaned)) return cleaned;
  return `@${username}`;
}

function unescapeInstagramJson(value: string): string {
  return value
    .replace(/\\u0026/g, "&")
    .replace(/\\u003c/g, "<")
    .replace(/\\u003e/g, ">")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"');
}

/** Parse profile fields embedded in Instagram HTML (og fetch / Microlink HTML). */
export function parseInstagramEmbeddedData(html: string): {
  fullName: string | null;
  username: string | null;
  profilePicUrl: string | null;
  biography: string | null;
} {
  const readJsonString = (key: string): string | null => {
    const match = html.match(
      new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "i"),
    );
    return match?.[1] ? unescapeInstagramJson(match[1]) : null;
  };

  const profilePicUrl =
    readJsonString("profile_pic_url_hd") ?? readJsonString("profile_pic_url");

  return {
    fullName: readJsonString("full_name"),
    username: readJsonString("username"),
    profilePicUrl,
    biography: readJsonString("biography"),
  };
}
