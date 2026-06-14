import { TRAFFIC_SOURCE_PARAM } from "@/lib/attribution/constants";
import { presetToTrafficSource, resolvePresetUtmParams } from "@/lib/attribution/presets";
import type { BuildTrackedUrlOptions, TrackedLinkPreset, UtmParams } from "@/lib/attribution/types";

function appendQueryParams(url: URL, params: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    url.searchParams.set(key, value);
  }
}

export function appendUtmParams(url: string, utm: UtmParams, extra?: Record<string, string | undefined>): string {
  try {
    const parsed = new URL(
      url,
      typeof window !== "undefined" ? window.location.origin : "https://the-velvet.netlify.app",
    );
    appendQueryParams(parsed, { ...utm, ...extra });
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return url;
  }
}

export function buildTrackedUrl(
  url: string,
  preset: TrackedLinkPreset,
  options: BuildTrackedUrlOptions = {},
): string {
  const utm = resolvePresetUtmParams(preset, options);
  const src = options.src ?? presetToTrafficSource(preset);
  const extra: Record<string, string | undefined> = {
    ...(src ? { [TRAFFIC_SOURCE_PARAM]: src } : {}),
    ...options.extraQuery,
  };

  try {
    const isAbsolute = /^https?:\/\//i.test(url);
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://the-velvet.netlify.app";
    const parsed = isAbsolute ? new URL(url) : new URL(url, base);
    appendQueryParams(parsed, { ...utm, ...extra });
    if (isAbsolute) return parsed.toString();
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

/** Build absolute tracked URL when only path is known (server/email). */
export function buildTrackedAbsoluteUrl(
  baseUrl: string,
  path: string,
  preset: TrackedLinkPreset,
  options: BuildTrackedUrlOptions = {},
): string {
  const trimmedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return buildTrackedUrl(`${trimmedBase}${normalizedPath}`, preset, options);
}
