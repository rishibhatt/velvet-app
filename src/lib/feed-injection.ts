import type { AdUnit } from "@/types/board.types";

export type FeedItem<T> =
  | { type: "board"; data: T }
  | { type: "ad"; data: AdUnit };

/** Insert ads every 8th slot; never place two ads consecutively. */
export function injectAdsIntoFeed<T>(
  boards: T[],
  ads: AdUnit[],
): FeedItem<T>[] {
  if (!ads.length) {
    return boards.map((data) => ({ type: "board" as const, data }));
  }

  const result: FeedItem<T>[] = [];
  let adIndex = 0;
  let lastWasAd = false;

  boards.forEach((board, index) => {
    const shouldTryAd =
      (index + 1) % 8 === 0 && !lastWasAd && ads.length > 0;

    if (shouldTryAd) {
      const ad = ads[adIndex % ads.length]!;
      result.push({ type: "ad", data: ad });
      adIndex++;
      lastWasAd = true;
    }

    result.push({ type: "board", data: board });
    lastWasAd = false;
  });

  return result;
}
