export { buildTrackedAbsoluteUrl, buildTrackedUrl, appendUtmParams } from "@/lib/attribution/build";
export {
  captureAttributionFromLocation,
  captureAttributionFromSearchParams,
} from "@/lib/attribution/capture";
export {
  ATTRIBUTION_STORAGE_KEY,
  TRAFFIC_SOURCE_PARAM,
  VELVET_UTM_SOURCE,
} from "@/lib/attribution/constants";
export { getAttributionProperties } from "@/lib/attribution/enrich";
export { hasAttributionParams, parseAttributionFromSearchParams } from "@/lib/attribution/parse";
export { presetToTrafficSource, resolvePresetUtmParams } from "@/lib/attribution/presets";
export { resolveTrafficSource } from "@/lib/attribution/resolve-source";
export { clearAttribution, getAttribution, setAttribution } from "@/lib/attribution/storage";
export type {
  AttributionSnapshot,
  BoardViewSource,
  BuildTrackedUrlOptions,
  PresetContext,
  TrackedLinkPreset,
  UtmParams,
} from "@/lib/attribution/types";
