"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/components/atoms/Avatar";
import { ROUTES } from "@/constants/routes";
import { useNotifications } from "@/queries/notifications/queries";
import { useMarkAllNotificationsRead } from "@/queries/notifications/mutations";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/board.types";

function groupNotifications(notifications: AppNotification[]) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const groups: { label: string; items: AppNotification[] }[] = [
    { label: "Today", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const n of notifications) {
    const age = now - new Date(n.created_at).getTime();
    if (age < day) groups[0]!.items.push(n);
    else if (age < 7 * day) groups[1]!.items.push(n);
    else groups[2]!.items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}

function getHref(notification: AppNotification) {
  const boardId = notification.metadata?.boardId;
  if (typeof boardId === "string") return ROUTES.board(boardId);
  if (notification.resource_type === "board" && notification.resource_id) {
    return ROUTES.board(notification.resource_id);
  }
  if (notification.type === "weekly_digest") return ROUTES.insights;
  return ROUTES.home;
}

export function NotificationsPageContent() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAll = useMarkAllNotificationsRead();

  useEffect(() => {
    markAll.mutate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = groupNotifications(notifications);

  return (
    <main className="page-container py-6 pb-28">
      <h1 className="font-display mb-6 text-2xl text-on-surface">Notifications</h1>

      {isLoading ? (
        <p className="text-sm text-on-surface-variant">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="rounded-2xl bg-surface-container-low px-4 py-12 text-center text-sm text-on-surface-variant">
          You&apos;re all caught up
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 text-xs font-bold tracking-wide text-on-surface-variant uppercase">
                {group.label}
              </h2>
              <ul className="space-y-2">
                {group.items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={getHref(n)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors",
                        n.read_at == null ? "bg-primary-fixed/25" : "bg-bg-elevated",
                      )}
                    >
                      <Avatar
                        src={n.actor?.avatar_url}
                        name={n.actor?.full_name ?? n.actor?.username ?? "Velvet"}
                        size="sm"
                        className="!h-9 !w-9 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-on-surface">{n.title}</p>
                        {n.body && (
                          <p className="text-sm text-on-surface-variant">{n.body}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-on-surface-variant">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
