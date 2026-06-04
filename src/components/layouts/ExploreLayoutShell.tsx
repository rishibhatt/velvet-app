"use client";

import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PublicGuestLayout } from "@/components/layouts/PublicGuestLayout";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function ExploreLayoutShell({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PublicGuestLayout>{children}</PublicGuestLayout>;
  }

  if (user) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <PublicGuestLayout>{children}</PublicGuestLayout>;
}
