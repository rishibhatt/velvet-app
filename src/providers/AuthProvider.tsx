"use client";

import type { ReactNode } from "react";

/** Auth state is managed via useAuth() hook (Supabase session + profile). */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
