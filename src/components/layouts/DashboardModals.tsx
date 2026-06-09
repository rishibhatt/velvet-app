"use client";

import dynamic from "next/dynamic";
import { useModalStore } from "@/store/modal.store";
import { useLazyMount } from "@/hooks/useLazyMount";

const CreateBoardModal = dynamic(
  () =>
    import("@/features/boards/components/CreateBoardModal").then((m) => ({
      default: m.CreateBoardModal,
    })),
  { ssr: false },
);

const SaveModal = dynamic(
  () =>
    import("@/components/organisms/SaveModal").then((m) => ({
      default: m.SaveModal,
    })),
  { ssr: false },
);

export function DashboardModals() {
  const createOpen = useModalStore((s) => s.createBoardModal);
  const saveOpen = useModalStore((s) => s.saveModal.open);

  const showCreate = useLazyMount(createOpen);
  const showSave = useLazyMount(saveOpen);

  return (
    <>
      {showCreate ? <CreateBoardModal /> : null}
      {showSave ? <SaveModal /> : null}
    </>
  );
}
