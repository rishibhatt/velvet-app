import { CLICK_ID_KEYS, UTM_PARAM_KEYS } from "@/lib/attribution/constants";
import type { UtmParams } from "@/lib/attribution/types";

export function parseAttributionFromSearchParams(
  params: URLSearchParams | { toString(): string; get(name: string): string | null },
): UtmParams {
  const result: UtmParams = {};

  for (const key of UTM_PARAM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) result[key] = value;
  }

  for (const key of CLICK_ID_KEYS) {
    const value = params.get(key)?.trim();
    if (value) result[key] = value;
  }

  return result;
}

export function hasAttributionParams(params: UtmParams): boolean {
  return Object.values(params).some((value) => Boolean(value));
}
