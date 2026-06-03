"use client";

import { useState } from "react";
import { Globe, Lock, Copy, Trash2, Sparkles } from "lucide-react";
import { ModalShell } from "@/components/organisms/ModalShell";
import { Button } from "@/components/atoms/Button";
import { SegmentButton } from "@/components/atoms/SegmentButton";
import { useUpdateBoard, useDeleteBoard } from "@/queries/board/mutations";
import { getPublicShareUrl } from "@/constants/routes";
import type { Board } from "@/types/board.types";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { UI_LABELS } from "@/constants/ui-labels";
import { confirmAction } from "@/lib/confirm";
import { velvetToast } from "@/lib/toast";
import { shareOrCopy } from "@/lib/share";
import { useModalStore } from "@/store/modal.store";
import {
  canDeleteBoard,
  canEditBoardMeta,
  canManageBoardSettings,
  formatAccessRole,
  getBoardAccessRole,
} from "@/lib/board-permissions";
import { useAuth } from "@/features/auth/hooks/useAuth";
interface BoardSettingsModalProps {
  board: Board;
  open: boolean;
  onClose: () => void;
}

export function BoardSettingsModal({
  board,
  open,
  onClose,
}: BoardSettingsModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const openShareSheet = useModalStore((s) => s.openShareSheet);
  const updateBoard = useUpdateBoard(board.id);
  const deleteBoard = useDeleteBoard();
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description ?? "");
  const [isPublic, setIsPublic] = useState(board.is_public);

  const accessRole = getBoardAccessRole(board, user?.id);
  const canEdit = canEditBoardMeta(board, user?.id);
  const canManage = canManageBoardSettings(board, user?.id);
  const canDelete = canDeleteBoard(board, user?.id);

  const resetForm = () => {
    setTitle(board.title);
    setDescription(board.description ?? "");
    setIsPublic(board.is_public);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!canEdit) return;
    try {
      await updateBoard.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        ...(canManage ? { isPublic } : {}),
      });
      velvetToast.success("Collection updated");
      onClose();
    } catch {
    }
  };

  const handleShare = async () => {
    if (!board.slug) {
      velvetToast.error("Migration needed", "Run migration 004 in Supabase SQL Editor.");
      return;
    }
    if (!isPublic) {
      velvetToast.info("Make it public", "Toggle visibility to Public to get a share link.");
      return;
    }
    const url = getPublicShareUrl(board.slug);
    const imageUrl =
      board.preview_images?.[0] ?? board.cover_url ?? undefined;
    openShareSheet({
      url,
      title: title.trim() || board.title,
      text: description.trim() || board.description || undefined,
      imageUrls: (board.preview_images ?? (imageUrl ? [imageUrl] : [])).slice(0, 4),
      eyebrow: "Velvet collection",
    });
  };

  const handleDelete = async () => {
    const ok = await confirmAction({
      title: `Delete "${board.title}"?`,
      description:
        "This permanently removes the collection and its saves. This cannot be undone.",
      confirmLabel: "Delete collection",
      cancelLabel: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteBoard.mutateAsync(board.id);
      velvetToast.success("Collection deleted");
      onClose();
      router.push(ROUTES.home);
    } catch {
    }
  };

  if (!canEdit) return null;

  const settingsFooter = (
    <div className="flex flex-col gap-2">
      <Button onClick={handleSave} loading={updateBoard.isPending} className="w-full">
        {UI_LABELS.saveChanges}
      </Button>
      {canManage && isPublic && board.slug && (
        <Button
          variant="gradient"
          icon={Copy}
          onClick={() => void handleShare()}
          className="w-full"
        >
          Share collection
        </Button>
      )}
      {canDelete && (
        <div className="velvet-modal-danger-zone mt-1">
          <Button
            variant="danger"
            icon={Trash2}
            onClick={handleDelete}
            loading={deleteBoard.isPending}
            className="w-full"
          >
            Delete collection
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      title="Collection settings"
      subtitle={
        accessRole
          ? `You're ${formatAccessRole(accessRole)} on this collection`
          : undefined
      }
      className="w-full sm:max-w-lg"
      contentClassName="px-0 py-0 sm:px-0 sm:py-0"
      footer={settingsFooter}
      responsive
    >
      <div className="max-h-[min(60vh,520px)] overflow-y-auto overscroll-y-contain custom-scrollbar">
        <section className="border-b border-outline-variant/15 bg-gradient-to-br from-primary-fixed/25 via-bg-elevated to-secondary-fixed/15 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg text-on-surface">Details</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Name and description appear on your collection and in share previews.
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-6 px-5 py-6 sm:px-6">
          <div className="space-y-1.5">
            <label htmlFor="board-title" className="block text-sm font-semibold text-on-surface">
              Title
            </label>
            <input
              id="board-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="velvet-field w-full rounded-xl px-4 py-3 text-base sm:text-sm"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="board-desc" className="block text-sm font-semibold text-on-surface">
              Description
            </label>
            <textarea
              id="board-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this collection about?"
              className="velvet-field w-full resize-none rounded-xl px-4 py-3 text-base sm:text-sm"
            />
          </div>

          {canManage && (
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/80 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                {isPublic ? (
                  <Globe className="h-5 w-5 text-primary" />
                ) : (
                  <Lock className="h-5 w-5 text-on-surface-variant" />
                )}
                <span className="text-sm font-semibold text-on-surface">Visibility</span>
              </div>
              <SegmentButton
                options={[
                  { value: "private", label: "Private" },
                  { value: "public", label: "Public" },
                ]}
                value={isPublic ? "public" : "private"}
                onChange={(v) => setIsPublic(v === "public")}
              />
              <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                Public collections appear in Explore and get a shareable link with preview images
                for social apps.
              </p>
            </div>
          )}

          {!canManage && (
            <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              Only the owner or an admin can change visibility and sharing. You can still edit the
              title and description.
            </p>
          )}

          {canManage && isPublic && board.slug && (
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                Public link
              </span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <p className="min-w-0 flex-1 break-all rounded-xl border border-outline-variant/30 bg-surface-container px-3 py-2.5 font-mono text-[11px] leading-relaxed text-on-surface sm:text-xs">
                  {getPublicShareUrl(board.slug)}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Copy}
                  className="shrink-0"
                  onClick={() =>
                    void shareOrCopy({
                      url: getPublicShareUrl(board.slug!),
                      title: board.title,
                      text: board.description ?? undefined,
                    })
                  }
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
