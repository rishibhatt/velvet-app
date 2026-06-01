"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/organisms/ModalShell";
import { Button } from "@/components/atoms/Button";
import { SegmentButton } from "@/components/atoms/SegmentButton";
import { useUpdateBoard, useDeleteBoard } from "@/queries/board/mutations";
import { getPublicShareUrl } from "@/constants/routes";
import type { Board } from "@/types/board.types";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Copy, Trash2 } from "lucide-react";
import { UI_LABELS } from "@/constants/ui-labels";
import { confirmAction } from "@/lib/confirm";
import { velvetToast } from "@/lib/toast";

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
  const updateBoard = useUpdateBoard(board.id);
  const deleteBoard = useDeleteBoard();
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description ?? "");
  const [isPublic, setIsPublic] = useState(board.is_public);

  useEffect(() => {
    setTitle(board.title);
    setDescription(board.description ?? "");
    setIsPublic(board.is_public);
  }, [board]);

  const handleSave = async () => {
    try {
      await updateBoard.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        isPublic,
      });
      velvetToast.success("Collection updated");
      onClose();
    } catch {
      /* global mutation toast */
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
    try {
      await navigator.clipboard.writeText(getPublicShareUrl(board.slug));
      velvetToast.success("Link copied!", "Share your public collection anywhere.");
    } catch {
      velvetToast.error("Couldn't copy", "Allow clipboard access or copy the URL manually.");
    }
  };

  const handleDelete = async () => {
    const ok = await confirmAction({
      title: `Delete “${board.title}”?`,
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
      /* global mutation toast */
    }
  };

  const settingsFooter = (
    <div className="flex flex-col gap-2">
      <Button onClick={handleSave} loading={updateBoard.isPending} className="w-full">
        {UI_LABELS.saveChanges}
      </Button>
      <Button
        variant="secondary"
        icon={Copy}
        onClick={handleShare}
        disabled={!board.slug}
        className="w-full"
      >
        Copy public link
      </Button>
      <Button
        variant="destructive"
        icon={Trash2}
        onClick={handleDelete}
        loading={deleteBoard.isPending}
        className="w-full"
      >
        Delete collection
      </Button>
    </div>
  );

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Collection settings"
      className="max-w-md"
      contentClassName="p-4 sm:p-6"
      footer={settingsFooter}
    >
      <div className="space-y-5 pb-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Visibility</label>
          <SegmentButton
            options={[
              { value: "private", label: "Private" },
              { value: "public", label: "Public" },
            ]}
            value={isPublic ? "public" : "private"}
            onChange={(v) => setIsPublic(v === "public")}
          />
        </div>

        {isPublic && board.slug && (
          <p className="rounded-xl bg-surface-container px-4 py-3 text-xs text-on-surface-variant break-all">
            {getPublicShareUrl(board.slug)}
          </p>
        )}

      </div>
    </ModalShell>
  );
}
