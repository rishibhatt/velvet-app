"use client";

import { ModalShell } from "@/components/organisms/ModalShell";
import { CollaboratorInviteFields } from "@/components/molecules/CollaboratorInviteFields";
import { useBoardDetail } from "@/queries/board/queries";
import { useModalStore } from "@/store/modal.store";

export function InviteModal() {
  const { inviteModal, closeInviteModal } = useModalStore();
  const boardId = inviteModal.boardId ?? "";
  const { data: board } = useBoardDetail(inviteModal.open ? boardId : "");

  const handleClose = () => {
    closeInviteModal();
  };

  return (
    <ModalShell
      open={inviteModal.open}
      onClose={handleClose}
      title="Invite collaborators"
      subtitle={
        board?.title
          ? `Add people to "${board.title}"`
          : "They will get a notification to accept or deny"
      }
      className="w-full sm:max-w-md"
      contentClassName="px-5 py-5 sm:px-6"
    >
      {boardId ? (
        <CollaboratorInviteFields
          boardId={boardId}
          isPublic={board?.is_public ?? true}
          existingUsernames={
            board?.members
              ?.map((m) => m.profile?.username)
              .filter((u): u is string => Boolean(u)) ?? []
          }
          onInvitesSent={handleClose}
        />
      ) : null}
    </ModalShell>
  );
}
