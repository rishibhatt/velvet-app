"use client";

import type { ReactNode } from "react";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";

/** Keeps notification queries in sync via Supabase Realtime while the user is signed in. */
export function NotificationRealtimeProvider({ children }: { children: ReactNode }) {
  useNotificationRealtime();
  return <>{children}</>;
}
