"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { useMemo, useState } from "react";
import { Bell, Check, CheckCheck, Heart, MessageCircle, UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import {
  useNotifications,
  useUnreadNotificationCount,
} from "@/queries/notifications/queries";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useRespondBoardInvite,
} from "@/queries/notifications/mutations";
import { useRespondCollaborationRequest } from "@/queries/collaboration/mutations";
import type { AppNotification } from "@/types/board.types";

function getMetadataStatus(notification: AppNotification) {
  const status = notification.metadata?.status;
  return typeof status === "string" ? status : "pending";
}

function getInvitationId(notification: AppNotification) {
  const invitationId = notification.metadata?.invitationId;
  return typeof invitationId === "string" ? invitationId : null;
}

function getRequestId(notification: AppNotification) {
  const requestId = notification.metadata?.requestId;
  return typeof requestId === "string" ? requestId : null;
}

function getNotificationDirection(notification: AppNotification) {
  const direction = notification.metadata?.direction;
  return typeof direction === "string" ? direction : null;
}

function getNotificationHref(notification: AppNotification) {
  const boardId = notification.metadata?.boardId;
  if (typeof boardId === "string") {
    return ROUTES.board(boardId);
  }
  if (notification.resource_type === "board" && notification.resource_id) {
    return ROUTES.board(notification.resource_id);
  }
  return ROUTES.home;
}

function NotificationIcon({ notification }: { notification: AppNotification }) {
  if (notification.type === "board_like") {
    return <Heart className="h-4 w-4 fill-current text-error" />;
  }
  if (notification.type === "item_comment") {
    return <MessageCircle className="h-4 w-4 text-primary" />;
  }
  return <UserPlus className="h-4 w-4 text-primary" />;
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: AppNotification;
  onClose: () => void;
}) {
  const markRead = useMarkNotificationRead();
  const respondInvite = useRespondBoardInvite();
  const respondCollabRequest = useRespondCollaborationRequest();
  const invitationId = getInvitationId(notification);
  const requestId = getRequestId(notification);
  const status = getMetadataStatus(notification);
  const direction = getNotificationDirection(notification);

  const isPendingInvite =
    notification.type === "board_invite" &&
    invitationId != null &&
    status === "pending";

  const isPendingCollabRequest =
    notification.type === "collab_request" &&
    requestId != null &&
    status === "pending" &&
    direction === "to_owner";

  const isResolvedCollabForRequester =
    notification.type === "collab_request" &&
    direction === "to_requester" &&
    (status === "accepted" || status === "denied");

  const isUnread = notification.read_at == null;
  const isResponding = respondInvite.isPending || respondCollabRequest.isPending;

  const handleNavigate = () => {
    if (isUnread) markRead.mutate(notification.id);
    onClose();
  };

  return (
    <article
      className={cn(
        "rounded-2xl border border-outline-variant/20 bg-bg-elevated p-3 shadow-sm",
        isUnread && "border-primary/25 bg-primary-fixed/20",
      )}
    >
      <div className="flex gap-3">
        <Avatar
          src={notification.actor?.avatar_url}
          name={notification.actor?.full_name ?? notification.actor?.username}
          size="sm"
          className="!h-9 !w-9 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">
              <NotificationIcon notification={notification} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-on-surface">
                {notification.title}
              </p>
              {notification.body && (
                <p className="mt-1 text-sm leading-snug text-on-surface-variant">
                  {notification.body}
                </p>
              )}
              <p className="mt-1.5 text-xs text-on-surface-variant">
                {formatRelativeTime(notification.created_at)}
              </p>
            </div>
          </div>

          {isPendingInvite ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant="gradient"
                icon={Check}
                loading={isResponding}
                onClick={() =>
                  respondInvite.mutate({ invitationId, accept: true })
                }
              >
                Accept
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isResponding}
                onClick={() =>
                  respondInvite.mutate({ invitationId, accept: false })
                }
              >
                Deny
              </Button>
            </div>
          ) : isPendingCollabRequest ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant="gradient"
                icon={Check}
                loading={isResponding}
                onClick={() =>
                  respondCollabRequest.mutate({ requestId, accept: true })
                }
              >
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isResponding}
                onClick={() =>
                  respondCollabRequest.mutate({ requestId, accept: false })
                }
              >
                Decline
              </Button>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-2">
              <Link
                href={getNotificationHref(notification)}
                onClick={handleNavigate}
                className="text-xs font-bold text-primary hover:underline"
              >
                {isResolvedCollabForRequester && status === "accepted"
                  ? "Open collection"
                  : "View"}
              </Link>
              {isUnread && (
                <button
                  type="button"
                  onClick={() => markRead.mutate(notification.id)}
                  className="text-xs font-semibold text-on-surface-variant hover:text-primary"
                >
                  Mark as Read
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const { isAuthenticated, isAuthReady } = useAuth();
  const [open, setOpen] = useState(false);
  const { data: notifications = [], isLoading, isError } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAllRead = useMarkAllNotificationsRead();

  const badgeLabel = useMemo(() => {
    if (unreadCount > 99) return "99+";
    if (unreadCount > 9) return "9+";
    return String(unreadCount);
  }, [unreadCount]);

  if (!isAuthReady || !isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          track(ANALYTICS_EVENTS.NOTIFICATION_BELL_TAPPED, { unread_count: unreadCount });
          if (window.innerWidth < 768) {
            router.push(ROUTES.notifications);
            return;
          }
          setOpen((v) => !v);
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ff3040] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-bg-elevated">
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] cursor-default bg-transparent"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <section className="fixed inset-x-3 top-16 z-[90] max-h-[min(76dvh,560px)] overflow-hidden rounded-3xl border border-outline-variant/25 bg-bg-elevated shadow-[var(--shadow-modal)] sm:absolute sm:right-0 sm:left-auto sm:top-12 sm:w-[380px]">
            <header className="flex items-center justify-between gap-3 border-b border-outline-variant/20 px-4 py-3">
              <div>
                <h2 className="font-display text-lg text-on-surface">
                  Notifications
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You are all caught up"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllRead.mutate()}
                    className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                    aria-label="Mark all read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="max-h-[calc(min(76dvh,560px)-72px)] overflow-y-auto overscroll-contain p-3 custom-scrollbar">
              {isLoading ? (
                <p className="rounded-2xl bg-surface-container-low px-4 py-8 text-center text-sm text-on-surface-variant">
                  Loading notifications...
                </p>
              ) : isError ? (
                <p className="rounded-2xl bg-error-container/35 px-4 py-8 text-center text-sm text-error">
                  Could not load notifications. Check that the notification migration has been run.
                </p>
              ) : notifications.length > 0 ? (
                <div className="space-y-2.5">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClose={() => setOpen(false)}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-surface-container-low px-4 py-8 text-center text-sm text-on-surface-variant">
                  No notifications yet.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
