"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { ModalShell } from "@/components/organisms/ModalShell";
import { useBoardDetail } from "@/queries/board/queries";
import { useInviteMember } from "@/queries/board/mutations";
import { useModalStore } from "@/store/modal.store";
import type { BoardRole } from "@/types/board.types";
import { cn } from "@/lib/utils";

const ROLES: { value: BoardRole; label: string; hint: string }[] = [
  { value: "viewer", label: "Viewer", hint: "Can view items" },
  { value: "editor", label: "Editor", hint: "Can add and remove items" },
  { value: "admin", label: "Admin", hint: "Can invite others and manage" },
];

export function InviteModal() {
  const { inviteModal, closeInviteModal } = useModalStore();
  const boardId = inviteModal.boardId ?? "";
  const { data: board } = useBoardDetail(inviteModal.open ? boardId : "");
  const invite = useInviteMember(boardId);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<BoardRole>("editor");

  const handleClose = () => {
    setUsername("");
    setRole("editor");
    closeInviteModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardId) return;
    try {
      await invite.mutateAsync({ username, role });
      setUsername("");
      handleClose();
    } catch {
      /* global mutation toast */
    }
  };

  return (
    <ModalShell
      open={inviteModal.open}
      onClose={handleClose}
      title="Invite collaborator"
      subtitle={
        board?.title
          ? `Add someone to “${board.title}”`
          : "They’ll see this collection in their library"
      }
      className="surface-panel max-w-md"
      contentClassName="p-stack-lg"
      footer={
        <Button
          type="submit"
          form="invite-collaborator-form"
          size="lg"
          icon={UserPlus}
          className="w-full"
          loading={invite.isPending}
        >
          Send invite
        </Button>
      }
    >
      <form id="invite-collaborator-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="invite-username" className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
            Username
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 focus-within:border-primary">
            <span className="text-on-surface-variant">@</span>
            <input
              id="invite-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="theirusername"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-on-surface placeholder:text-outline/70 focus:outline-none"
              required
            />
          </div>
          <p className="text-xs text-on-surface-variant">
            They must already have a Velvet account with this username.
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
            Role
          </span>
          <div className="grid gap-2">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors",
                  role === r.value
                    ? "border-primary bg-primary-container/30"
                    : "border-outline-variant/30 bg-surface-container-low hover:border-outline-variant/60",
                )}
              >
                <span>
                  <span className="block text-sm font-semibold text-on-surface">{r.label}</span>
                  <span className="text-xs text-on-surface-variant">{r.hint}</span>
                </span>
                <input
                  type="radio"
                  name="invite-role"
                  value={r.value}
                  checked={role === r.value}
                  onChange={() => setRole(r.value)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            ))}
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
