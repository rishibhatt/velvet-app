"use client";

import { useTrackBoardView } from "@/hooks/useTrackBoardView";

export function BoardViewTracker({
  boardId,
  mood,
  source = "direct",
}: {
  boardId: string;
  mood?: string | null;
  source?: string;
}) {
  useTrackBoardView(boardId, source, mood);
  return null;
}
