"use client";

import { ConfirmDialog } from "@/components/organisms/ConfirmDialog";
import { ItemDetailModal } from "@/components/organisms/ItemDetailModal";
import { InviteModal } from "@/features/boards/components/InviteModal";

/** Modals available on public routes and dashboard (not tied to dashboard layout only). */
export function GlobalModals() {
  return (
    <>
      <ItemDetailModal />
      <InviteModal />
      <ConfirmDialog />
    </>
  );
}
