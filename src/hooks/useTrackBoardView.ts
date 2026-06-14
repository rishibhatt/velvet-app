"use client";

import { useEffect } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { getAttributionProperties } from "@/lib/attribution";
import type { BoardViewSource } from "@/lib/attribution";

export function useTrackBoardView(
  boardId: string,
  source?: BoardViewSource | string,
  mood?: string | null,
) {
  useEffect(() => {
    if (!boardId) return;
    const key = `velvet_viewed_${boardId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const attribution = getAttributionProperties();

    void fetch(`/api/boards/${boardId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: source ?? "direct",
        referrer: typeof document !== "undefined" ? document.referrer : "",
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
      }),
    }).catch(() => {});

    track(ANALYTICS_EVENTS.BOARD_VIEWED_PUBLIC, {
      board_id: boardId,
      mood: mood ?? undefined,
      source: source ?? "direct",
      is_owner: false,
      ...attribution,
    });
  }, [boardId, source, mood]);
}
