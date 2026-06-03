import { ROUTES } from "@/constants/routes";

const trimSlash = (url: string) => url.replace(/\/$/, "");

/**
 * Canonical app origin for server, emails, and config screens.
 * Set NEXT_PUBLIC_APP_URL when using ngrok, preview deploys, or production
 * (e.g. https://abc123.ngrok-free.app or https://app.yoursite.com).
 */
export function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return trimSlash(fromEnv);

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "";
}

/** Resolve base URL from an incoming request (works for ngrok, Vercel, local). */
export function getAppBaseUrlFromHeaders(headerStore: {
  get(name: string): string | null;
}): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return trimSlash(fromEnv);

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) return getAppBaseUrl();

  const proto =
    headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "http";
  return `${proto}://${host}`;
}

/** Browser-only: always the URL the user is actually on (best for OAuth in dev). */
export function getClientAppBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getAppBaseUrl();
}

export function getAuthCallbackUrl(baseUrl?: string): string {
  const base = baseUrl ?? getClientAppBaseUrl() ?? getAppBaseUrl();
  return base ? `${trimSlash(base)}${ROUTES.authCallback}` : ROUTES.authCallback;
}

export function getOnboardingUrl(baseUrl?: string): string {
  const base = baseUrl ?? getClientAppBaseUrl() ?? getAppBaseUrl();
  return base ? `${trimSlash(base)}${ROUTES.onboarding}` : ROUTES.onboarding;
}

export function getLoginUrl(baseUrl?: string): string {
  const base = baseUrl ?? getClientAppBaseUrl() ?? getAppBaseUrl();
  return base ? `${trimSlash(base)}${ROUTES.login}` : ROUTES.login;
}

export function getResetPasswordUrl(baseUrl?: string): string {
  const base = baseUrl ?? getClientAppBaseUrl() ?? getAppBaseUrl();
  return base ? `${trimSlash(base)}${ROUTES.resetPassword}` : ROUTES.resetPassword;
}

export function getVerifyEmailUrl(baseUrl?: string): string {
  const base = baseUrl ?? getClientAppBaseUrl() ?? getAppBaseUrl();
  return base ? `${trimSlash(base)}${ROUTES.verifyEmail}` : ROUTES.verifyEmail;
}

export function getPublicShareUrl(
  username: string,
  slug: string,
  baseUrl?: string,
): string {
  const base = baseUrl ?? getClientAppBaseUrl() ?? getAppBaseUrl();
  const path = username
    ? ROUTES.publicCollection(username, slug)
    : ROUTES.legacyPublicCollection(slug);
  return base ? `${trimSlash(base)}${path}` : path;
}

export function getCreatorProfileUrl(username: string, baseUrl?: string): string {
  const base = baseUrl ?? getClientAppBaseUrl() ?? getAppBaseUrl();
  const path = ROUTES.creator(username);
  return base ? `${trimSlash(base)}${path}` : path;
}

/** URLs to allow in Supabase → Authentication → Redirect URLs. */
export function getSupabaseRedirectUrlHints(baseUrl: string): string[] {
  const urls = new Set<string>();
  if (baseUrl) {
    const root = trimSlash(baseUrl);
    urls.add(root);
    urls.add(`${root}${ROUTES.authCallback}`);
    urls.add(`${root}${ROUTES.onboarding}`);
    urls.add(`${root}${ROUTES.login}`);
    urls.add(`${root}${ROUTES.resetPassword}`);
    urls.add(`${root}${ROUTES.verifyEmail}`);
    urls.add(`${root}/**`);
  }
  return [...urls];
}
