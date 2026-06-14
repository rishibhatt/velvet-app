import { ROUTES } from "@/constants/routes";
import { buildTrackedUrl } from "@/lib/attribution";
import type { PresetContext } from "@/lib/attribution";

const trimSlash = (url: string) => url.replace(/\/$/, "");

export type UrlBuilderOptions = {
  baseUrl?: string;
  /** When false, skip UTM tagging (e.g. canonical SEO URLs). Default true. */
  track?: boolean;
  presetContext?: PresetContext;
};

function resolveUrlOptions(options?: string | UrlBuilderOptions): UrlBuilderOptions {
  if (typeof options === "string") return { baseUrl: options };
  return options ?? {};
}

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

export function getEmailVerifiedUrl(baseUrl?: string): string {
  const base = baseUrl ?? getClientAppBaseUrl() ?? getAppBaseUrl();
  return base ? `${trimSlash(base)}${ROUTES.emailVerified}` : ROUTES.emailVerified;
}

export function getPublicShareUrl(
  username: string,
  slug: string,
  options?: string | UrlBuilderOptions,
): string {
  const { baseUrl, track = true, presetContext } = resolveUrlOptions(options);
  const base = baseUrl ?? getClientAppBaseUrl() ?? getAppBaseUrl();
  const path = username
    ? ROUTES.publicCollection(username, slug)
    : ROUTES.legacyPublicCollection(slug);
  const raw = base ? `${trimSlash(base)}${path}` : path;

  if (!track) return raw;

  return buildTrackedUrl(raw, "share_collection", {
    username,
    slug,
    ...presetContext,
  });
}

export function getCreatorProfileUrl(
  username: string,
  options?: string | UrlBuilderOptions,
): string {
  const { baseUrl, track = true, presetContext } = resolveUrlOptions(options);
  const base = baseUrl ?? getClientAppBaseUrl() ?? getAppBaseUrl();
  const path = ROUTES.creator(username);
  const raw = base ? `${trimSlash(base)}${path}` : path;

  if (!track) return raw;

  return buildTrackedUrl(raw, "share_profile", {
    username,
    ...presetContext,
  });
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
    urls.add(`${root}${ROUTES.emailVerified}`);
    urls.add(`${root}/**`);
  }
  return [...urls];
}
