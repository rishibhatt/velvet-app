"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/organisms/Navbar";
import { CreateBoardModal } from "@/features/boards/components/CreateBoardModal";
import { SaveModal } from "@/components/organisms/SaveModal";
import { SupabaseGuard } from "@/components/layouts/SupabaseGuard";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SupabaseGuard>
      <div className="relative min-h-screen pb-24 md:pb-0">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] h-[40vw] w-[40vw] rounded-full bg-primary-container/20 blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] h-[30vw] w-[30vw] rounded-full bg-secondary-container/30 blur-[100px]" />
        </div>
        <Navbar />
        <div className="relative z-10">{children}</div>
        <CreateBoardModal />
        <SaveModal />
      </div>
    </SupabaseGuard>
  );
}
