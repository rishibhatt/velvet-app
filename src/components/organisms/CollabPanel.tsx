"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { CollaboratorSearchInput } from "@/components/molecules/CollaboratorSearchInput";
import { slideInRight } from "@/lib/animations";
import { formatMemberRole } from "@/lib/collaborators";
import { formatRelativeTime } from "@/utils/format";
import type { ActivityLog, BoardMember, BoardRole } from "@/types/board.types";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useInviteMember, useRemoveMember } from "@/queries/board/mutations";
import { usePendingCollaborationRequests } from "@/queries/collaboration/queries";
import { useRespondCollaborationRequest } from "@/queries/collaboration/mutations";
import { useModalStore } from "@/store/modal.store";
import { confirmAction } from "@/lib/confirm";
import { cn } from "@/lib/utils";

interface CollabPanelProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  members: BoardMember[];
  activities: ActivityLog[];
  canManage?: boolean;
  ownerId?: string;
}

export function CollabPanel({
  open,
  onClose,
  boardId,
  members,
  activities,
  canManage = false,
  ownerId,
}: CollabPanelProps) {
  useBodyScrollLock(open);
  const { openInviteModal } = useModalStore();
  const invite = useInviteMember(boardId);
  const removeMember = useRemoveMember(boardId);
  const respondRequest = useRespondCollaborationRequest();
  const { data: pendingRequests = [] } = usePendingCollaborationRequests(
    boardId,
    canManage,
  );
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<BoardRole>("editor");

  const handleInlineInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await invite.mutateAsync({ username, role });
      setUsername("");
    } catch {
      /* toast */
    }
  };

  const handleRemove = async (member: BoardMember) => {
    if (member.user_id === ownerId) return;
    const name = member.profile?.username
      ? `@${member.profile.username}`
      : "this collaborator";
    const ok = await confirmAction({
      title: `Remove ${name}?`,
      description: "They will lose access to this collection.",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await removeMember.mutateAsync(member.id);
    } catch {
      /* toast */
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-overlay-dark md:bg-transparent"
        onClick={onClose}
        aria-hidden
      />
      <motion.aside
        {...slideInRight}
        className="fixed top-0 right-0 z-[95] flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col overflow-hidden border-l border-outline-variant/30 bg-bg-elevated shadow-modal sm:max-w-[min(100%,360px)]"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
          <h2 className="font-display text-lg text-on-surface">Collaboration</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-on-surface hover:bg-surface-container-low"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain custom-scrollbar p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {canManage && pendingRequests.length > 0 && (
            <section className="mb-8">
              <h3 className="mb-3 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                Pending requests ({pendingRequests.length})
              </h3>
              <ul className="space-y-3">
                {pendingRequests.map((request) => (
                  <li
                    key={request.id}
                    className="rounded-2xl border border-primary/20 bg-primary-fixed/25 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={request.requester?.avatar_url}
                        name={
                          request.requester?.full_name ??
                          request.requester?.username
                        }
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-on-surface">
                          {request.requester?.full_name ??
                            request.requester?.username ??
                            "Someone"}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Wants to collaborate as {formatMemberRole(request.role)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="gradient"
                        loading={respondRequest.isPending}
                        onClick={() =>
                          respondRequest.mutate({
                            requestId: request.id,
                            accept: true,
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={respondRequest.isPending}
                        onClick={() =>
                          respondRequest.mutate({
                            requestId: request.id,
                            accept: false,
                          })
                        }
                      >
                        Decline
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {canManage && (
            <section className="mb-8">
              <h3 className="mb-3 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                Invite
              </h3>
              <form onSubmit={handleInlineInvite} className="space-y-3">
                <CollaboratorSearchInput
                  value={username}
                  onChange={setUsername}
                  placeholder="username"
                  inputClassName="text-sm"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as BoardRole)}
                  className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                  aria-label="Collaborator role"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <Button
                  type="submit"
                  size="sm"
                  icon={UserPlus}
                  className="w-full"
                  loading={invite.isPending}
                >
                  Invite
                </Button>
              </form>
              <button
                type="button"
                onClick={() => openInviteModal(boardId)}
                className="mt-2 text-xs font-semibold text-primary hover:underline"
              >
                Open full invite dialog
              </button>
            </section>
          )}

          <section className="mb-8">
            <h3 className="mb-3 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
              Members ({members.length})
            </h3>
            <ul className="space-y-3">
              {members.map((member) => {
                const isOwner = member.user_id === ownerId;
                return (
                  <li key={member.id} className="flex items-center gap-3">
                    <Avatar
                      src={member.profile?.avatar_url}
                      name={member.profile?.full_name ?? member.profile?.username}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-on-surface">
                        {member.profile?.full_name ?? member.profile?.username}
                        {member.profile?.username && (
                          <span className="ml-1 font-normal text-on-surface-variant">
                            @{member.profile.username}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {isOwner ? "Owner" : formatMemberRole(member.role)}
                      </p>
                    </div>
                    {canManage && !isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemove(member)}
                        disabled={removeMember.isPending}
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-error transition-colors hover:bg-error-container/40",
                          removeMember.isPending && "opacity-50",
                        )}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                );
              })}
              {members.length === 0 && (
                <p className="text-sm text-on-surface-variant">No members yet.</p>
              )}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
              Activity
            </h3>
            <ul className="space-y-4">
              {activities.map((activity) => (
                <li key={activity.id} className="flex gap-3">
                  <Avatar
                    src={activity.profile?.avatar_url}
                    name={activity.profile?.full_name}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-on-surface">
                      <span className="font-semibold">
                        {activity.profile?.full_name?.split(" ")[0] ?? "Someone"}
                      </span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </li>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-on-surface-variant">
                  Activity will appear here as you save and collaborate.
                </p>
              )}
            </ul>
          </section>
        </div>
      </motion.aside>
    </>
  );
}
