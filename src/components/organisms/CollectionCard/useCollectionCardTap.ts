"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNavigationProgress } from "@/providers/NavigationProgressProvider";

const DOUBLE_TAP_MS = 260;

export function useCollectionCardTap(
  href: string,
  options: {
    onNavigate?: () => void;
    onDoubleTap?: () => void;
    enabled?: boolean;
  } = {},
) {
  const router = useRouter();
  const pathname = usePathname();
  const { startNavigation } = useNavigationProgress();
  const [isPending, setIsPending] = useState(false);
  const tapsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { onNavigate, onDoubleTap, enabled = true } = options;

  useEffect(() => {
    setIsPending(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    tapsRef.current = 0;
  }, [pathname]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const beginOpening = useCallback(() => {
    startNavigation();
    setIsPending(true);
  }, [startNavigation]);

  const navigate = useCallback(() => {
    if (!enabled) return;
    onNavigate?.();
    router.push(href);
  }, [enabled, href, onNavigate, router]);

  const openCollection = useCallback(() => {
    if (!enabled) return;
    beginOpening();
    navigate();
  }, [beginOpening, enabled, navigate]);

  const handleTap = useCallback(() => {
    if (!enabled) return;

    tapsRef.current += 1;

    if (tapsRef.current === 1) {
      beginOpening();
      timerRef.current = setTimeout(() => {
        tapsRef.current = 0;
        timerRef.current = null;
        navigate();
      }, DOUBLE_TAP_MS);
      return;
    }

    if (tapsRef.current >= 2) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      tapsRef.current = 0;
      setIsPending(false);
      onDoubleTap?.();
    }
  }, [beginOpening, enabled, navigate, onDoubleTap]);

  return { handleTap, openCollection, isPending };
}
