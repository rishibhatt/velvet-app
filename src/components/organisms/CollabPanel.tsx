"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { slideInRight } from "@/lib/animations";
import { formatRelativeTime } from "@/utils/format";
import type { ActivityLog, BoardMember } from "@/types/board.types";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface CollabPanelProps {
  open: boolean;
  onClose: () => void;
  members: BoardMember[];
  activities: ActivityLog[];
}

export function CollabPanel({
  open,
  onClose,
  members,
  activities,
}: CollabPanelProps) {
  useBodyScrollLock(open);

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
          <section className="mb-8">
            <h3 className="mb-3 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
              Members
            </h3>
            <ul className="space-y-3">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3">
                  <Avatar
                    src={member.profile?.avatar_url}
                    name={member.profile?.full_name ?? member.profile?.username}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-on-surface">
                      {member.profile?.full_name ?? member.profile?.username}
                    </p>
                    <p className="text-xs capitalize text-on-surface-variant">
                      {member.role}
                    </p>
                  </div>
                </li>
              ))}
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
