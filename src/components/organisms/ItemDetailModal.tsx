"use client";

import { useState } from "react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  ExternalLink,
  Send,
  Trash2,
  Link2,
  Pencil,
  Check,
} from "lucide-react";
import { confirmAction } from "@/lib/confirm";
import { shareOrCopy } from "@/lib/share";
import { Button } from "@/components/atoms/Button";
import { Avatar } from "@/components/atoms/Avatar";
import { SourceBadge } from "@/components/molecules/SourceBadge";
import { useItemDetail } from "@/queries/item/queries";
import { useDeleteItem, useUpdateItem } from "@/queries/item/mutations";
import {
  useComments,
  useAddComment,
} from "@/queries/comment/queries";
import { useModalStore } from "@/store/modal.store";
import { formatRelativeTime } from "@/utils/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { ItemSource } from "@/types/board.types";

function ItemPreview({
  imageUrl,
  title,
  type,
  description,
  source,
}: {
  imageUrl: string | null;
  title: string | null;
  type: string;
  description?: string | null;
  source: ItemSource | null;
}) {
  if (imageUrl) {
    return (
      <VelvetImage
        src={imageUrl}
        alt={title ?? "Saved item"}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, 420px"
      />
    );
  }

  if (type === "note") {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center bg-gradient-to-br from-primary-fixed/50 via-secondary-fixed/30 to-tertiary-fixed/40 p-8">
        <p className="font-display max-w-md text-center text-xl leading-snug text-on-surface">
          {description ?? title}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-[200px] flex-col items-center justify-center gap-4 p-8",
        source === "instagram" && "bg-gradient-to-br from-[#fdf2f8] to-[#fce7f3]",
        source === "youtube" && "bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]",
        source === "pinterest" && "bg-gradient-to-br from-tertiary-fixed/40 to-secondary-fixed/30",
        (!source || source === "web" || source === "amazon" || source === "upload") &&
          "bg-gradient-to-br from-surface-container to-primary-fixed/25",
      )}
    >
      <Link2 className="h-10 w-10 text-primary" />
      {source && <SourceBadge source={source} />}
      <p className="font-display line-clamp-3 text-center text-lg text-on-surface">
        {title ?? "Saved link"}
      </p>
    </div>
  );
}

export function ItemDetailModal() {
  const { itemModal, closeItemModal } = useModalStore();
  const itemId = itemModal.itemId ?? "";
  const { data: fetchedItem, isLoading } = useItemDetail(itemId);
  const addComment = useAddComment(itemId);
  const { profile } = useAuth();
  const [commentText, setCommentText] = useState("");

  const item =
    fetchedItem?.id === itemId
      ? fetchedItem
      : itemModal.snapshot?.id === itemId
        ? itemModal.snapshot
        : undefined;

  const readOnly = itemModal.readOnly ?? false;
  const canEdit = (itemModal.canEdit ?? false) && !readOnly;
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const curatorName =
    itemModal.curatorLabel ??
    profile?.full_name ??
    profile?.username ??
    "You";

  const { data: comments = [] } = useComments(itemId);
  const boardId =
    itemModal.boardId ?? item?.board_id ?? "";
  const deleteItem = useDeleteItem(boardId);
  const updateItem = useUpdateItem(boardId);

  useBodyScrollLock(itemModal.open && Boolean(item));

  const handleShare = async () => {
    if (!item) return;
    const url =
      item.source_url?.trim() ||
      (typeof window !== "undefined" ? window.location.href : "");
    await shareOrCopy({
      title: item.title ?? "Velvet save",
      text: item.title ?? undefined,
      url,
    });
  };

  const handleDelete = async () => {
    if (!item) return;
    const ok = await confirmAction({
      title: "Remove from collection?",
      description:
        "This save will be removed from the collection. You can add it again anytime.",
      confirmLabel: "Remove",
      cancelLabel: "Keep it",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteItem.mutateAsync(item.id);
      closeItemModal();
    } catch {
      /* mutation global toast */
    }
  };

  const startEditing = () => {
    if (!item || !canEdit) return;
    setEditTitle(item.title ?? "");
    setEditNotes(item.notes ?? "");
    setEditing(true);
  };

  const cancelEditing = () => {
    if (!item) return;
    setEditTitle(item.title ?? "");
    setEditNotes(item.notes ?? "");
    setEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!item || !canEdit) return;
    const nextTitle = editTitle.trim() || null;
    const nextNotes = editNotes.trim() || null;
    try {
      await updateItem.mutateAsync({
        itemId: item.id,
        title: nextTitle,
        notes: nextNotes,
        description: item.type === "note" ? nextNotes : item.description,
      });
      setEditing(false);
    } catch {
      /* mutation toast */
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || readOnly) return;
    try {
      await addComment.mutateAsync(commentText);
      setCommentText("");
    } catch {
      /* toast via mutation cache */
    }
  };

  const showModal = itemModal.open && Boolean(item);

  return (
    <AnimatePresence>
      {showModal && item && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-inverse-surface/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeItemModal}
        >
          <motion.article
            key={item.id}
            className="flex h-[100dvh] max-h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[1.75rem] border border-outline-variant/25 bg-bg-elevated shadow-[var(--shadow-modal)] sm:h-auto sm:max-h-[min(90dvh,calc(100dvh-3rem))] sm:rounded-3xl lg:min-h-[min(640px,85vh)] lg:flex-row"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media column */}
            <div className="relative w-full shrink-0 overflow-hidden bg-surface-container lg:w-[min(46%,500px)] lg:border-r lg:border-outline-variant/20">
              <div className="relative aspect-[5/6] max-h-[min(44dvh,420px)] w-full sm:aspect-[4/5] sm:max-h-[min(48dvh,460px)] lg:absolute lg:inset-0 lg:aspect-auto lg:max-h-none">
                <ItemPreview
                  imageUrl={item.image_url}
                  title={item.title}
                  type={item.type}
                  description={item.description ?? item.notes}
                  source={item.source}
                />
              </div>
              {item.source && (
                <div className="absolute top-4 left-4 z-10 lg:top-5 lg:left-5">
                  <SourceBadge source={item.source} />
                </div>
              )}
            </div>

            {/* Content column */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <header className="flex shrink-0 items-center justify-end gap-2 border-b border-outline-variant/15 px-4 py-3 sm:px-6 lg:px-8">
                {canEdit && !editing && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={Pencil}
                    onClick={startEditing}
                  >
                    Edit
                  </Button>
                )}
                {editing && (
                  <div className="mr-auto flex items-center gap-2">
                    <Button
                      type="button"
                      variant="gradient"
                      size="sm"
                      icon={Check}
                      onClick={() => void handleSaveEdit()}
                      loading={updateItem.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                      disabled={updateItem.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Share2}
                  onClick={() => void handleShare()}
                  className="hidden sm:inline-flex"
                >
                  Share
                </Button>
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface transition hover:bg-primary/10 hover:text-primary sm:hidden"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={closeItemModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface transition hover:bg-primary/10 hover:text-primary"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain custom-scrollbar px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
                {isLoading && !fetchedItem && (
                  <p className="mb-4 text-xs text-on-surface-variant">Loading…</p>
                )}

                {editing ? (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="item-title"
                      className="block text-sm font-semibold text-on-surface"
                    >
                      Save name
                    </label>
                    <input
                      id="item-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Untitled save"
                      className="velvet-field w-full rounded-xl px-4 py-3 font-display text-2xl leading-[1.15] text-on-surface sm:text-3xl lg:text-[2rem]"
                      autoComplete="off"
                    />
                  </div>
                ) : (
                  <h1 className="font-display text-2xl leading-[1.15] text-on-surface sm:text-3xl lg:text-[2rem]">
                    {item.title ?? "Untitled save"}
                  </h1>
                )}

                <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-on-surface-variant">
                  <span>
                    Curated by{" "}
                    <span className="font-semibold text-primary">{curatorName}</span>
                  </span>
                  <span className="text-outline-variant" aria-hidden>
                    ·
                  </span>
                  <time dateTime={item.created_at}>
                    {formatRelativeTime(item.created_at)}
                  </time>
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {item.source_url && (
                    <Button
                      type="button"
                      variant="gradient"
                      icon={ExternalLink}
                      onClick={() =>
                        window.open(item.source_url!, "_blank", "noopener,noreferrer")
                      }
                    >
                      View source
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    icon={Share2}
                    onClick={() => void handleShare()}
                    className="sm:hidden"
                  >
                    Share
                  </Button>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-primary-fixed/55 px-3 py-1.5 text-xs font-semibold text-on-primary-fixed-variant ring-1 ring-outline-variant/10"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {editing ? (
                  <div className="mt-8 rounded-2xl border border-outline-variant/20 bg-surface-container-low/80 p-5 lg:p-6">
                    <label
                      htmlFor="item-notes"
                      className="mb-2 block text-xs font-bold tracking-[0.2em] text-primary uppercase"
                    >
                      Notes
                    </label>
                    <textarea
                      id="item-notes"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={4}
                      placeholder="Add a note for this save"
                      className="velvet-field w-full resize-none rounded-xl px-4 py-3 text-base leading-relaxed text-on-surface"
                    />
                  </div>
                ) : item.notes ? (
                  <div className="mt-8 rounded-2xl border border-outline-variant/20 bg-surface-container-low/80 p-5 lg:p-6">
                    <h3 className="mb-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">
                      {readOnly ? "Notes" : "Your notes"}
                    </h3>
                    <p className="text-base leading-relaxed text-on-surface lg:text-[1.05rem]">
                      {item.notes}
                    </p>
                  </div>
                ) : null}

                <section className="mt-10 border-t border-outline-variant/20 pt-8 lg:mt-12 lg:pt-10">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="font-display text-xl text-on-surface lg:text-2xl">
                      Reflections
                    </h2>
                    <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                      {comments.length}{" "}
                      {comments.length === 1 ? "comment" : "comments"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {comments.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-outline-variant/35 bg-surface-container-low/50 px-4 py-8 text-center text-sm text-on-surface-variant">
                        {readOnly
                          ? "No reflections yet."
                          : "Be the first to leave a reflection."}
                      </p>
                    )}
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-3 rounded-2xl bg-surface-container-low/90 p-4 ring-1 ring-outline-variant/10"
                      >
                        <Avatar
                          src={comment.profile?.avatar_url}
                          name={comment.profile?.full_name}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-on-surface">
                              {comment.profile?.full_name}
                            </span>
                            <span className="text-xs text-on-surface-variant">
                              {formatRelativeTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!readOnly && (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-4">
                      <Avatar
                        src={profile?.avatar_url}
                        name={profile?.full_name ?? profile?.username}
                        size="md"
                      />
                      <div className="relative min-w-0 flex-1">
                        <input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleComment()}
                          placeholder="Add a reflection..."
                          className="w-full rounded-xl border border-outline-variant/30 bg-bg-elevated px-3 py-3 pr-11 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
                          aria-label="Add comment"
                        />
                        <button
                          type="button"
                          onClick={handleComment}
                          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2 text-primary transition hover:bg-primary/10"
                          aria-label="Send comment"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {!readOnly && (
                <footer className="shrink-0 border-t border-outline-variant/15 bg-surface-container-low/40 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 lg:px-10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {canEdit ? (
                      <Button
                        type="button"
                        variant="secondary"
                        icon={editing ? Check : Pencil}
                        className="w-full shrink-0 sm:w-auto"
                        onClick={
                          editing
                            ? () => void handleSaveEdit()
                            : startEditing
                        }
                        loading={updateItem.isPending}
                      >
                        {editing ? "Save changes" : "Edit save"}
                      </Button>
                    ) : (
                      <p className="text-xs text-on-surface-variant">
                        You can view this save, but only collection editors can change it.
                      </p>
                    )}
                    {canEdit && (
                      <Button
                        variant="secondary"
                        icon={Trash2}
                        className="w-full shrink-0 !border-error/35 !text-error sm:w-auto"
                        onClick={handleDelete}
                        loading={deleteItem.isPending}
                      >
                        Remove from collection
                      </Button>
                    )}
                  </div>
                </footer>
              )}
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
