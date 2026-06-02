"use client";

import { useCallback, useEffect, useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const DEFAULT_PAGE = 12;

/** Reveal more items when sentinel enters view (Instagram-style feed). */
export function useInfiniteSlice<T>(items: T[], pageSize = DEFAULT_PAGE) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items.length, pageSize]);

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + pageSize, items.length));
  }, [items.length, pageSize]);

  const sentinelRef = useIntersectionObserver(loadMore, {
    rootMargin: "240px",
    threshold: 0,
  });

  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return { visible, sentinelRef, hasMore, loadMore };
}
