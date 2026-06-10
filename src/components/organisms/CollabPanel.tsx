"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { ClientPortal } from "@/components/atoms/ClientPortal";
import { CollaboratorInviteFields } from "@/components/molecules/CollaboratorInviteFields";
import { slideInRight } from "@/lib/animations";
import { formatMemberRole } from "@/lib/collaborators";
import { formatRelativeTime } from "@/utils/format";
import type { ActivityLog, BoardMember } from "@/types/board.types";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useRemoveMember } from "@/queries/board/mutations";
import { usePendingCollaborationRequests } from "@/queries/collaboration/queries";
import { useRespondCollaborationRequest } from "@/queries/collaboration/mutations";
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
  isPublic?: boolean;
}

function PanelCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="flex shrink-0 min-h-10 min-w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface ring-1 ring-outline-variant/25 transition hover:bg-primary/10 hover:text-primary"
      aria-label="Close collaboration panel"
    >
      <X className="h-5 w-5" />
    </button>
  );
}

function SectionHeading({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="min-w-0 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
        {children}
      </h3>
      {action}
    </div>
  );
}

export function CollabPanel({
  open,
  onClose,
  boardId,
  members,
  activities,
  canManage = false,
  ownerId,
  isPublic = true,
}: CollabPanelProps) {
  useBodyScrollLock(open);
  const removeMember = useRemoveMember(boardId);
  const respondRequest = useRespondCollaborationRequest();
  const { data: pendingRequests = [] } = usePendingCollaborationRequests(
    boardId,
    canManage,
  );

  const memberUsernames =
    members
      .map((m) => m.profile?.username)
      .filter((u): u is string => Boolean(u)) ?? [];

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
    <ClientPortal>
      <div
        className="fixed inset-0 z-[100] bg-overlay-dark md:bg-transparent"
        onClick={onClose}
        aria-hidden
      />
      <motion.aside
        {...slideInRight}
        role="dialog"
        aria-modal="true"
        aria-label="Collaboration"
        className="fixed top-0 right-0 z-[100] flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col overflow-hidden border-l border-outline-variant/30 bg-bg-elevated shadow-modal sm:max-w-[min(100%,360px)]"
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain custom-scrollbar px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-5 sm:pt-4">
          {canManage && pendingRequests.length > 0 && (
            <section className="mb-8">
              <SectionHeading>
                Pending requests ({pendingRequests.length})
              </SectionHeading>
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
              <SectionHeading action={<PanelCloseButton onClose={onClose} />}>
                Invite
              </SectionHeading>
              <CollaboratorInviteFields
                boardId={boardId}
                isPublic={isPublic}
                existingUsernames={memberUsernames}
              />
            </section>
          )}

          <section className="mb-8">
            <SectionHeading
              action={!canManage ? <PanelCloseButton onClose={onClose} /> : undefined}
            >
              Members ({members.length})
            </SectionHeading>
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
            <SectionHeading>Activity</SectionHeading>
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
    </ClientPortal>
  );
}
