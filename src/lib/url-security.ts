const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/** Reject URLs that could be used for SSRF against internal networks. */
export function isSafeExternalUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTS.has(hostname)) return false;
    if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return false;
    if (isPrivateIpv4(hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

const ALLOWED_REDIRECT_PREFIXES = [
  "/",
  "/onboarding",
  "/boards",
  "/profile",
  "/settings",
  "/search",
  "/explore",
  "/reset-password",
  "/verify-email",
];

/** Allowlist post-OAuth redirect paths to prevent open redirects. */
export function sanitizeAuthRedirect(next: string | null): string {
  const fallback = "/onboarding";
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;

  const path = next.split("?")[0] ?? next;
  const allowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  return allowed ? next : fallback;
}
