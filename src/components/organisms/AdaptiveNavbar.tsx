"use client";

import { Navbar } from "@/components/organisms/Navbar";
import { PublicNavbar } from "@/components/organisms/PublicNavbar";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** Full app nav when signed in; minimal discover + auth CTAs for guests. */
export function AdaptiveNavbar() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PublicNavbar />;
  }

  if (user) {
    return <Navbar />;
  }

  return <PublicNavbar />;
}
