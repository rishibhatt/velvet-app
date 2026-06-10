"use client";

import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ClarityProvider } from "@/lib/analytics/clarity";
import { GoogleAnalyticsProvider } from "@/lib/analytics/google";
import {
  ANALYTICS_EVENTS,
  identify,
  initAnalytics,
  resetAnalytics,
  track,
  trackPageView,
} from "@/lib/analytics";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { boardsService } from "@/services/boards/boards.service";
import { boardKeys } from "@/queries/board/keys";

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <GoogleAnalyticsProvider />
      <ClarityProvider />
      <Suspense fallback={null}>
        <AnalyticsRuntime />
      </Suspense>
      {children}
    </>
  );
}

function AnalyticsRuntime() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, profile, isAuthenticated, isAuthReady } = useAuth();
  const { data: boards = [] } = useQuery({
    queryKey: boardKeys.list(),
    queryFn: () => boardsService.getBoards(),
    enabled: isAuthenticated,
    meta: { skipErrorToast: true, errorContext: "board" },
  });
  const lastPageRef = useRef<string | null>(null);
  const identifiedUserRef = useRef<string | null>(null);

  useEffect(() => {
    const boot = () => {
      initAnalytics();
      if (!sessionStorage.getItem("velvet_session_started")) {
        sessionStorage.setItem("velvet_session_started", "1");
        track(ANALYTICS_EVENTS.SESSION_STARTED);
      }
    };

    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(boot, { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }

    const timer = setTimeout(boot, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    if (lastPageRef.current === path) return;
    lastPageRef.current = path;
    trackPageView(window.location.href, document.title);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated || !user) {
      if (identifiedUserRef.current) resetAnalytics();
      identifiedUserRef.current = null;
      return;
    }
    const signature = `${user.id}:${profile?.username ?? ""}:${boards.length}`;
    if (identifiedUserRef.current === signature) return;
    identify({
      id: user.id,
      email: user.email,
      username: profile?.username,
      collection_count: boards.length,
    });
    identifiedUserRef.current = signature;
  }, [boards.length, isAuthReady, isAuthenticated, profile?.username, user]);

  return null;
}
