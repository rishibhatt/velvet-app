"use client";

import { useEffect } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

export function useTrackBoardView(
  boardId: string,
  source?: string,
  mood?: string | null,
) {
  useEffect(() => {
    if (!boardId) return;
    const key = `velvet_viewed_${boardId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    void fetch(`/api/boards/${boardId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: source ?? "direct",
        referrer: typeof document !== "undefined" ? document.referrer : "",
      }),
    }).catch(() => {});

    track(ANALYTICS_EVENTS.BOARD_VIEWED_PUBLIC, {
      board_id: boardId,
      mood: mood ?? undefined,
      source: source ?? "direct",
      is_owner: false,
    });
  }, [boardId, source, mood]);
}
