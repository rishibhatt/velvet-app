"use client";

import type { ReactNode } from "react";
import { PublicNavbar } from "@/components/organisms/PublicNavbar";
import { SupabaseGuard } from "@/components/layouts/SupabaseGuard";

/** Browse-only shell for guests (explore, public collections, profiles). */
export function PublicGuestLayout({ children }: { children: ReactNode }) {
  return (
    <SupabaseGuard>
      <div className="relative min-h-screen bg-background pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] h-[40vw] w-[40vw] rounded-full bg-primary-container/15 blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] h-[30vw] w-[30vw] rounded-full bg-secondary-container/20 blur-[100px]" />
        </div>
        <PublicNavbar />
        <div className="relative z-10">{children}</div>
      </div>
    </SupabaseGuard>
  );
}
