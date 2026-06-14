import { VELVET_UTM_SOURCE } from "@/lib/attribution/constants";
import type { PresetContext, TrackedLinkPreset, UtmParams } from "@/lib/attribution/types";

type PresetDefinition = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: (ctx: PresetContext) => string | undefined;
};

const PRESETS: Record<TrackedLinkPreset, PresetDefinition> = {
  share_collection: {
    utm_source: VELVET_UTM_SOURCE,
    utm_medium: "share",
    utm_campaign: "collection",
    utm_content: ({ username, slug }) =>
      username && slug ? `${username}/${slug}` : undefined,
  },
  share_profile: {
    utm_source: VELVET_UTM_SOURCE,
    utm_medium: "share",
    utm_campaign: "profile",
    utm_content: ({ username }) => username,
  },
  share_item: {
    utm_source: VELVET_UTM_SOURCE,
    utm_medium: "share",
    utm_campaign: "item",
    utm_content: ({ boardId, itemId }) =>
      boardId && itemId ? `${boardId}/${itemId}` : undefined,
  },
  email_digest: {
    utm_source: VELVET_UTM_SOURCE,
    utm_medium: "email",
    utm_campaign: "weekly_digest",
    utm_content: ({ userId }) => userId,
  },
  internal_explore: {
    utm_source: VELVET_UTM_SOURCE,
    utm_medium: "internal",
    utm_campaign: "explore",
  },
  internal_search: {
    utm_source: VELVET_UTM_SOURCE,
    utm_medium: "internal",
    utm_campaign: "search",
    utm_content: ({ query }) => query,
  },
  internal_tag: {
    utm_source: VELVET_UTM_SOURCE,
    utm_medium: "internal",
    utm_campaign: "tag",
    utm_content: ({ slug }) => slug,
  },
  internal_category: {
    utm_source: VELVET_UTM_SOURCE,
    utm_medium: "internal",
    utm_campaign: "category",
    utm_content: ({ mood }) => mood,
  },
  internal_home: {
    utm_source: VELVET_UTM_SOURCE,
    utm_medium: "internal",
    utm_campaign: "home",
  },
};

export function resolvePresetUtmParams(
  preset: TrackedLinkPreset,
  context: PresetContext = {},
): UtmParams {
  const definition = PRESETS[preset];
  const utm_content = definition.utm_content?.(context);

  return {
    utm_source: definition.utm_source,
    utm_medium: definition.utm_medium,
    utm_campaign: definition.utm_campaign,
    ...(utm_content ? { utm_content } : {}),
  };
}

export function presetToTrafficSource(preset: TrackedLinkPreset): string | undefined {
  switch (preset) {
    case "internal_explore":
    case "internal_home":
      return "explore";
    case "internal_search":
      return "search";
    case "internal_tag":
      return "tag";
    case "internal_category":
      return "category";
    case "share_collection":
    case "share_profile":
    case "share_item":
      return "share";
    default:
      return undefined;
  }
}
