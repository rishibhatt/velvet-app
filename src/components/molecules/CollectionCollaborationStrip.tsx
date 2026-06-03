"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  Pencil,
  Users,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useCollectionCollaborationState } from "@/hooks/useCollectionCollaborationState";
import { useDuplicateBoard, useRequestCollaboration } from "@/queries/board/mutations";
import { useUIStore } from "@/store/ui.store";
import { velvetToast } from "@/lib/toast";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Board } from "@/types/board.types";

interface CollectionCollaborationStripProps {
  board: Board;
  userId: string | undefined;
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
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        toneClasses,
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg-elevated shadow-sm ring-1 ring-outline-variant/20">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base text-on-surface sm:text-lg">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            {description}
          </p>
        </div>
      </div>
      {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

/** Collaboration CTAs and status — lives below the hero on public collection pages. */
export function CollectionCollaborationStrip({
  board,
  userId,
  className,
}: CollectionCollaborationStripProps) {
  const router = useRouter();
  const { setCollabPanelOpen } = useUIStore();
  const { collabState, isOwner, isMember, canEdit } = useCollectionCollaborationState(
    board,
    userId,
  );
  const duplicateBoard = useDuplicateBoard();
  const requestCollab = useRequestCollaboration(board.id);

  if (isOwner) return null;

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

  if (collabState === "request_pending") {
    return (
      <section className={cn("space-y-3", className)}>
        <StatusCard
          tone="primary"
          icon={<Clock className="h-5 w-5 text-primary" aria-hidden />}
          title="Collaboration request sent"
          description="The curator was notified and can approve or decline. You'll get a notification when they respond — then you can edit based on the role they grant."
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/90 px-3 py-1.5 text-xs font-semibold text-on-surface-variant ring-1 ring-outline-variant/25">
            <Bell className="h-3.5 w-3.5 text-primary" aria-hidden />
            Check your notifications
          </span>
        </StatusCard>
        {userId && (
          <div className="flex justify-start">
            <Button
              variant="secondary"
              size="sm"
              icon={Copy}
              loading={duplicateBoard.isPending}
              onClick={() => void handleDuplicate()}
            >
              Duplicate collection
            </Button>
          </div>
        )}
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
          description="Open notifications to accept or decline. Once accepted, you'll be able to edit this collection based on your role."
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated/90 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
            <Bell className="h-3.5 w-3.5" aria-hidden />
            Open notifications
          </span>
        </StatusCard>
        {userId && (
          <div className="flex justify-start">
            <Button
              variant="secondary"
              size="sm"
              icon={Copy}
              loading={duplicateBoard.isPending}
              onClick={() => void handleDuplicate()}
            >
              Duplicate collection
            </Button>
          </div>
        )}
      </section>
    );
  }

  if (isMember) {
    return (
      <section className={cn("space-y-3", className)}>
        <StatusCard
          tone="success"
          icon={<CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />}
          title={canEdit ? "You're a collaborator" : "You're on this collection"}
          description={
            canEdit
              ? "You can add and edit saves in this collection."
              : "You have viewer access to this collection."
          }
        >
          {canEdit && (
            <Button
              variant="gradient"
              size="sm"
              icon={Pencil}
              onClick={() => router.push(ROUTES.board(board.id))}
            >
              Edit collection
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={Users}
            onClick={() => setCollabPanelOpen(true)}
          >
            Collaborators
          </Button>
        </StatusCard>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {userId ? (
        <Button
          variant="gradient"
          size="sm"
          icon={Users}
          loading={requestCollab.isPending}
          className="w-full sm:w-auto"
          onClick={() => void handleRequestCollab()}
        >
          Request to collaborate
        </Button>
      ) : (
        <Link href={ROUTES.login} className="w-full sm:w-auto">
          <Button variant="gradient" size="sm" icon={Users} className="w-full">
            Sign in to collaborate
          </Button>
        </Link>
      )}
      {userId && (
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
      )}
    </section>
  );
}
