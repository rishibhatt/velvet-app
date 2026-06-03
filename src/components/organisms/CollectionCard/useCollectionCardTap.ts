"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const DOUBLE_TAP_MS = 280;

export function useCollectionCardTap(
  href: string,
  options: {
    onNavigate?: () => void;
    onDoubleTap?: () => void;
    enabled?: boolean;
  } = {},
) {
  const router = useRouter();
  const tapsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { onNavigate, onDoubleTap, enabled = true } = options;

  const handleTap = useCallback(() => {
    if (!enabled) return;

    tapsRef.current += 1;

    if (tapsRef.current === 1) {
      timerRef.current = setTimeout(() => {
        tapsRef.current = 0;
        onNavigate?.();
        router.push(href);
      }, DOUBLE_TAP_MS);
      return;
    }

    if (tapsRef.current >= 2) {
      if (timerRef.current) clearTimeout(timerRef.current);
      tapsRef.current = 0;
      onDoubleTap?.();
    }
  }, [enabled, href, onDoubleTap, onNavigate, router]);

  return handleTap;
}
