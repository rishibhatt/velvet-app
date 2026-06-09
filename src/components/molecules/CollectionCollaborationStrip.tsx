"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Clock,
  Copy,
  Heart,
  Mail,
  Pencil,
  Users,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { VelvetActionStatsBar } from "@/components/molecules/VelvetActionStatsBar";
import {
  VELVET_TOOLBAR_CARD,
  VELVET_TOOLBAR_CARD_INNER,
} from "@/constants/velvet-toolbar";
import { useCollectionCollaborationState } from "@/hooks/useCollectionCollaborationState";
import { useDuplicateBoard, useRequestCollaboration } from "@/queries/board/mutations";
import { useUIStore } from "@/store/ui.store";
import { velvetToast } from "@/lib/toast";
import { ROUTES } from "@/constants/routes";
import { loginWithReturn } from "@/lib/auth-redirect-path";
import { cn } from "@/lib/utils";
import type { Board } from "@/types/board.types";

interface CollectionCollaborationStripProps {
  board: Board;
  userId: string | undefined;
  likeCount?: number;
  collaboratorCount?: number;
  className?: string;
}

function StatusCard({
  icon,
  title,
  description,
  tone = "neutral",
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  tone?: "neutral" | "primary" | "success";
  children?: ReactNode;
}) {
  const toneClasses = {
    neutral: "border-outline-variant/30 bg-surface-container-low",
    primary: "border-primary/25 bg-primary-fixed/35",
    success: "border-primary/30 bg-primary-fixed/40",
  }[tone];

  return (
    <div className={cn(VELVET_TOOLBAR_CARD, toneClasses)}>
      <div className={cn(VELVET_TOOLBAR_CARD_INNER, "flex gap-3 sm:gap-4")}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg-elevated shadow-sm ring-1 ring-outline-variant/20">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base text-on-surface sm:text-lg">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            {description}
          </p>
          {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

function useCollaborationActions(board: Board, userId: string | undefined) {
  const router = useRouter();
  const duplicateBoard = useDuplicateBoard();
  const requestCollab = useRequestCollaboration(board.id);

  const handleDuplicate = () => {
    if (!userId) {
      velvetToast.info("Sign in required", "Create an account to duplicate this collection.");
      return;
    }
    duplicateBoard.mutate(board.id, {
      onSuccess: (copy) => {
        velvetToast.success("Collection duplicated", "A private copy was added to your workspace.");
        router.push(ROUTES.board(copy.id));
      },
    });
  };

  const handleRequestCollab = () => {
    if (!userId) {
      velvetToast.info("Sign in required", "Sign in to request collaboration.");
      return;
    }
    requestCollab.mutate(undefined, {
      onSuccess: () => {
        velvetToast.success(
          "Request sent",
          "The curator will get a notification to approve or decline.",
        );
      },
    });
  };

  return {
    duplicateBoard,
    requestCollab,
    handleDuplicate,
    handleRequestCollab,
  };
}

/** Collaboration CTAs and status — lives below the hero on public collection pages. */
export function CollectionCollaborationStrip({
  board,
  userId,
  likeCount = board.like_count ?? 0,
  collaboratorCount = board.members?.length ?? 0,
  className,
}: CollectionCollaborationStripProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setCollabPanelOpen } = useUIStore();
  const { collabState, isOwner, isMember, canEdit } = useCollectionCollaborationState(
    board,
    userId,
  );
  const { duplicateBoard, requestCollab, handleDuplicate, handleRequestCollab } =
    useCollaborationActions(board, userId);

  const stats = [
    { icon: Heart, value: likeCount, label: "Likes" },
    { icon: Users, value: collaboratorCount, label: "Collaborators" },
  ];

  if (isOwner) return null;

  if (collabState === "request_pending") {
    return (
      <section className={cn("space-y-3", className)}>
        <StatusCard
          tone="primary"
          icon={<Clock className="h-5 w-5 text-primary" aria-hidden />}
          title="Collaboration request sent"
          description="The curator was notified and can approve or decline. You'll get a notification when they respond."
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/90 px-3 py-1.5 text-xs font-semibold text-on-surface-variant ring-1 ring-outline-variant/25">
            <Bell className="h-3.5 w-3.5 text-primary" aria-hidden />
            Check your notifications
          </span>
        </StatusCard>
        {userId ? (
          <VelvetActionStatsBar
            actions={
              <Button
                variant="secondary"
                size="sm"
                icon={Copy}
                loading={duplicateBoard.isPending}
                className="w-full sm:w-auto"
                onClick={() => void handleDuplicate()}
              >
                Duplicate collection
              </Button>
            }
            stats={stats}
          />
        ) : null}
      </section>
    );
  }

  if (collabState === "invite_pending") {
    return (
      <section className={cn("space-y-3", className)}>
        <StatusCard
          tone="primary"
          icon={<Mail className="h-5 w-5 text-primary" aria-hidden />}
          title="You have a collaboration invite"
          description="Open notifications to accept or decline. Once accepted, you'll edit based on your role."
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/90 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
            <Bell className="h-3.5 w-3.5" aria-hidden />
            Open notifications
          </span>
        </StatusCard>
        {userId ? (
          <VelvetActionStatsBar
            actions={
              <Button
                variant="secondary"
                size="sm"
                icon={Copy}
                loading={duplicateBoard.isPending}
                className="w-full sm:w-auto"
                onClick={() => void handleDuplicate()}
              >
                Duplicate collection
              </Button>
            }
            stats={stats}
          />
        ) : null}
      </section>
    );
  }

  if (isMember) {
    return (
      <VelvetActionStatsBar
        className={className}
        actions={
          <>
            <span className="inline-flex w-full items-center justify-center rounded-full bg-primary-fixed/50 px-3 py-2 text-xs font-semibold text-primary ring-1 ring-primary/15 sm:w-auto sm:py-1.5">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {canEdit ? "You're a collaborator" : "You're on this collection"}
            </span>
            {canEdit ? (
              <Button
                variant="primary"
                size="sm"
                icon={Pencil}
                className="w-full sm:w-auto"
                onClick={() => router.push(ROUTES.board(board.id))}
              >
                Edit collection
              </Button>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              icon={Users}
              className="w-full sm:w-auto"
              onClick={() => setCollabPanelOpen(true)}
            >
              Collaborators
            </Button>
          </>
        }
        stats={stats}
      />
    );
  }

  return (
    <VelvetActionStatsBar
      className={className}
      actions={
        <>
          {userId ? (
            <Button
              variant="primary"
              size="sm"
              icon={Users}
              loading={requestCollab.isPending}
              className="w-full sm:w-auto"
              onClick={() => void handleRequestCollab()}
            >
              Request to collaborate
            </Button>
          ) : (
            <Link href={loginWithReturn(pathname || ROUTES.explore)} className="w-full sm:w-auto">
              <Button variant="primary" size="sm" icon={Users} className="w-full">
                Sign in to collaborate
              </Button>
            </Link>
          )}
          {userId ? (
            <Button
              variant="secondary"
              size="sm"
              icon={Copy}
              loading={duplicateBoard.isPending}
              className="w-full sm:w-auto"
              onClick={() => void handleDuplicate()}
            >
              Duplicate collection
            </Button>
          ) : null}
        </>
      }
      stats={stats}
    />
  );
}
