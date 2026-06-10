"use client";

import { useEffect, useState } from "react";
import { Copy, Trash2, Share2, Link2, FileText } from "lucide-react";
import { CollectionVisibilityToggle } from "@/components/molecules/CollectionVisibilityToggle";
import { ModalShell } from "@/components/organisms/ModalShell";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { DestructiveIconButton } from "@/components/atoms/DestructiveIconButton";
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
  const { user, profile } = useAuth();
  const openShareSheet = useModalStore((s) => s.openShareSheet);
  const updateBoard = useUpdateBoard(board.id);
  const deleteBoard = useDeleteBoard();
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description ?? "");
  const [isPublic, setIsPublic] = useState(board.is_public);

  const canEdit = canEditBoardMeta(board, user?.id);
  const canManage = canManageBoardSettings(board, user?.id);
  const canDelete = canDeleteBoard(board, user?.id);

  const username = profile?.username ?? "";
  const publicUrl =
    board.slug && canManage && isPublic && username
      ? getPublicShareUrl(username, board.slug)
      : null;

  const showShare = canManage && isPublic && Boolean(board.slug) && Boolean(username);

  useEffect(() => {
    if (!open) return;
    setTitle(board.title);
    setDescription(board.description ?? "");
    setIsPublic(board.is_public);
  }, [open, board.id, board.title, board.description, board.is_public]);

  const resetForm = () => {
    setTitle(board.title);
    setDescription(board.description ?? "");
    setIsPublic(board.is_public);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const persistVisibility = async (nextPublic: boolean) => {
    const updated = await updateBoard.mutateAsync({ isPublic: nextPublic });
    setIsPublic(updated.is_public);
    velvetToast.success(
      updated.is_public ? "Now public" : "Now private",
      updated.is_public
        ? "This collection appears in Explore and can be shared."
        : "Hidden from Explore until you make it public again.",
    );
  };

  const requestVisibilityChange = async (nextPublic: boolean) => {
    if (nextPublic === isPublic || updateBoard.isPending) return;

    if (nextPublic) {
      const ok = await confirmAction({
        title: "Make this collection public?",
        description:
          "It will appear in Explore and anyone with the link can view it. You can switch back to private anytime.",
        confirmLabel: "Make public",
        cancelLabel: "Cancel",
      });
      if (!ok) return;
      try {
        await persistVisibility(true);
      } catch {
        /* toast via mutation */
      }
      return;
    }

    const ok = await confirmAction({
      title: "Make this collection private?",
      description:
        "It will be hidden from Explore and the public link will stop working until you make it public again.",
      confirmLabel: "Make private",
      cancelLabel: "Keep public",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await persistVisibility(false);
    } catch {
      /* toast via mutation */
    }
  };

  const handleSave = async () => {
    if (!canEdit) return;
    try {
      await updateBoard.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
      });
      velvetToast.success("Saved", "Title and description were updated.");
      onClose();
    } catch {
      /* toast via mutation */
    }
  };

  const handleShare = () => {
    if (!board.slug) {
      velvetToast.error("Setup required", "Run slug migration in Supabase (see /setup).");
      return;
    }
    if (!isPublic) {
      velvetToast.info("Collection is private", "Make it public to share a link.");
      return;
    }
    if (!username) {
      velvetToast.error("Username required", "Add a username in your profile to share.");
      return;
    }
    openShareSheet({
      url: getPublicShareUrl(username, board.slug),
      title: title.trim() || board.title,
      text: description.trim() || board.description || undefined,
      imageUrls: (board.preview_images ?? []).slice(0, 4),
      eyebrow: "Velvet collection",
    });
  };

  const handleDelete = async () => {
    const ok = await confirmAction({
      title: `Delete "${board.title}"?`,
      description: "All saves in this collection will be removed. This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteBoard.mutateAsync(board.id);
      velvetToast.success("Deleted", "The collection was removed.");
      onClose();
      router.push(ROUTES.home);
    } catch {
      /* toast via mutation */
    }
  };

  if (!canEdit) return null;

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      title="Collection settings"
      subtitle="Update your collection name, description, and visibility"
      className="max-w-[520px] sm:mx-auto"
      contentClassName="p-0"
      responsive
      footer={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => void handleSave()}
            size="lg"
            loading={updateBoard.isPending}
            className="min-w-0 flex-1"
          >
            {UI_LABELS.saveChanges}
          </Button>
          {showShare && (
            <IconButton label="Share collection" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </IconButton>
          )}
          {canDelete && (
            <DestructiveIconButton
              label="Delete collection"
              onClick={() => void handleDelete()}
            >
              <Trash2 className="h-5 w-5" />
            </DestructiveIconButton>
          )}
        </div>
      }
    >
      <div className="border-b border-outline-variant/15 bg-surface-container-low/40 p-4 sm:p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="board-title"
              className="flex items-center gap-2 text-sm font-semibold text-on-surface"
            >
              <FileText className="h-4 w-4 text-primary" />
              Title
            </label>
            <input
              id="board-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="velvet-field w-full rounded-xl px-4 py-3 text-sm"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="board-desc"
              className="text-sm font-semibold text-on-surface"
            >
              Description{" "}
              <span className="font-normal text-on-surface-variant">(optional)</span>
            </label>
            <textarea
              id="board-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this collection about?"
              className="velvet-field w-full resize-none rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 sm:pt-2">
        {publicUrl && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <Link2 className="h-4 w-4 text-primary" />
              Public link
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-bg-elevated px-3 py-2.5">
              <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-on-surface-variant">
                {publicUrl}
              </p>
              <IconButton
                label="Copy link"
                onClick={() =>
                  void shareOrCopy({
                    url: publicUrl,
                    title: board.title,
                    text: board.description ?? undefined,
                  })
                }
                className="!h-9 !w-9 !min-h-9 !min-w-9"
              >
                <Copy className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        )}

        {canManage && (
          <CollectionVisibilityToggle
            isPublic={isPublic}
            onChange={(next) => void requestVisibilityChange(next)}
            disabled={updateBoard.isPending}
          />
        )}
      </div>
    </ModalShell>
  );
}
