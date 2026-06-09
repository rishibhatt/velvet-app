"use client";

import dynamic from "next/dynamic";
import { useModalStore } from "@/store/modal.store";
import { useConfirmStore } from "@/store/confirm.store";
import { useLazyMount } from "@/hooks/useLazyMount";

const ItemDetailModal = dynamic(
  () =>
    import("@/components/organisms/ItemDetailModal").then((m) => ({
      default: m.ItemDetailModal,
    })),
  { ssr: false },
);

const ShareSheet = dynamic(
  () =>
    import("@/components/organisms/ShareSheet").then((m) => ({
      default: m.ShareSheet,
    })),
  { ssr: false },
);

const InviteModal = dynamic(
  () =>
    import("@/features/boards/components/InviteModal").then((m) => ({
      default: m.InviteModal,
    })),
  { ssr: false },
);

const ConfirmDialog = dynamic(
  () =>
    import("@/components/organisms/ConfirmDialog").then((m) => ({
      default: m.ConfirmDialog,
    })),
  { ssr: false },
);

/** Modals available on public routes and dashboard (not tied to dashboard layout only). */
export function GlobalModals() {
  const itemOpen = useModalStore((s) => s.itemModal.open);
  const shareOpen = useModalStore((s) => s.shareSheet.open);
  const inviteOpen = useModalStore((s) => s.inviteModal.open);
  const confirmOpen = useConfirmStore((s) => s.open);

  const showItem = useLazyMount(itemOpen);
  const showShare = useLazyMount(shareOpen);
  const showInvite = useLazyMount(inviteOpen);
  const showConfirm = useLazyMount(confirmOpen);

  return (
    <>
      {showItem ? <ItemDetailModal /> : null}
      {showShare ? <ShareSheet /> : null}
      {showInvite ? <InviteModal /> : null}
      {showConfirm ? <ConfirmDialog /> : null}
    </>
  );
}
