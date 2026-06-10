"use client";

import { useEffect, useRef, useState } from "react";
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
  XCircle,
  Repeat2,
  Loader2,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchUrlMetadata } from "@/services/metadata/metadata.service";
import { ResaveToBoardSheet } from "@/features/resave/components/ResaveToBoardSheet";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { confirmAction } from "@/lib/confirm";
import { getItemShareUrl } from "@/lib/item-resource";
import { shareOrCopy } from "@/lib/share";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { DestructiveIconButton } from "@/components/atoms/DestructiveIconButton";
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
import { getItemPreviewImage } from "@/lib/item-preview";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { Item, ItemSource } from "@/types/board.types";

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
  const { profile, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [resaveOpen, setResaveOpen] = useState(false);

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
  const [editSourceUrl, setEditSourceUrl] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editSource, setEditSource] = useState<ItemSource>("web");
  const [editDescription, setEditDescription] = useState("");
  const [metadataLoading, setMetadataLoading] = useState(false);
  const metadataRequestRef = useRef(0);
  const debouncedEditUrl = useDebounce(editSourceUrl, 500);
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

  const resetEditState = (from: Item) => {
    setEditTitle(from.title ?? "");
    setEditNotes(from.notes ?? "");
    setEditSourceUrl(from.source_url ?? "");
    setEditImageUrl(from.image_url);
    setEditSource(from.source ?? "web");
    setEditDescription(from.description ?? "");
    setMetadataLoading(false);
  };

  const isLinkEditable = item?.type !== "note";

  useEffect(() => {
    if (!itemModal.open || !itemModal.startEditing || !item || !canEdit) return;
    resetEditState(item);
    setEditing(true);
    useModalStore.setState((state) => ({
      itemModal: { ...state.itemModal, startEditing: false },
    }));
  }, [itemModal.open, itemModal.startEditing, item, canEdit]);

  useEffect(() => {
    if (!editing || !isLinkEditable || !debouncedEditUrl.trim()) {
      setMetadataLoading(false);
      return;
    }

    const requestId = ++metadataRequestRef.current;
    setMetadataLoading(true);

    fetchUrlMetadata(debouncedEditUrl)
      .then((meta) => {
        if (requestId !== metadataRequestRef.current) return;
        setEditImageUrl(meta.imageUrl);
        setEditSource(meta.source);
        setEditDescription(meta.description ?? "");
        setEditTitle(meta.title);
      })
      .catch(() => {
        if (requestId !== metadataRequestRef.current) return;
      })
      .finally(() => {
        if (requestId === metadataRequestRef.current) setMetadataLoading(false);
      });
  }, [debouncedEditUrl, editing, isLinkEditable]);

  const handleShare = async () => {
    if (!item) return;
    await shareOrCopy({
      title: item.title ?? "Velvet save",
      text: item.title ?? undefined,
      url: getItemShareUrl(item),
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
    resetEditState(item);
    setEditing(true);
  };

  const cancelEditing = () => {
    if (!item) return;
    resetEditState(item);
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
        description:
          item.type === "note"
            ? nextNotes
            : editDescription.trim() || item.description,
        ...(isLinkEditable && editSourceUrl.trim()
          ? {
              sourceUrl: editSourceUrl.trim(),
              imageUrl: editImageUrl,
              source: editSource,
              type: "url" as const,
            }
          : {}),
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

  const previewImage =
    editing && isLinkEditable
      ? getItemPreviewImage({
          image_url: editImageUrl,
          source_url: editSourceUrl,
          source: editSource,
        })
      : item
        ? getItemPreviewImage(item)
        : null;

  const previewTitle = editing ? editTitle : (item?.title ?? null);
  const previewSource = editing && isLinkEditable ? editSource : (item?.source ?? null);

  return (
    <>
    <AnimatePresence>
      {showModal && item && (
        <motion.div
          key={item.id}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-inverse-surface/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeItemModal}
        >
          <motion.article
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
                  imageUrl={previewImage}
                  title={previewTitle}
                  type={item.type}
                  description={
                    editing && isLinkEditable
                      ? editDescription || editNotes
                      : item.description ?? item.notes
                  }
                  source={previewSource}
                />
                {editing && metadataLoading && isLinkEditable && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-inverse-surface/45 backdrop-blur-[2px]">
                    <Loader2 className="h-8 w-8 animate-spin text-white" aria-hidden />
                    <span className="text-xs font-medium text-white">
                      Fetching preview…
                    </span>
                  </div>
                )}
              </div>
              {previewSource && (
                <div className="absolute top-4 left-4 z-10 lg:top-5 lg:left-5">
                  <SourceBadge source={previewSource} />
                </div>
              )}
            </div>

            {/* Content column */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <header className="flex shrink-0 items-center justify-end gap-2 border-b border-outline-variant/15 px-4 py-3 sm:px-6 lg:px-8">
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface transition hover:bg-primary/10 hover:text-primary"
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
                  <div className="space-y-4">
                    {isLinkEditable && (
                      <div className="space-y-1.5">
                        <label
                          htmlFor="item-source-url"
                          className="flex items-center gap-2 text-sm font-semibold text-on-surface"
                        >
                          <Link2 className="h-4 w-4 text-primary" />
                          Link URL
                        </label>
                        <input
                          id="item-source-url"
                          type="url"
                          value={editSourceUrl}
                          onChange={(e) => setEditSourceUrl(e.target.value)}
                          placeholder="https://..."
                          className="velvet-field w-full rounded-xl px-4 py-3 text-sm text-on-surface"
                          autoComplete="off"
                          aria-busy={metadataLoading}
                        />
                        <p className="text-xs text-on-surface-variant">
                          Paste or change the link — preview image and title update
                          automatically.
                        </p>
                      </div>
                    )}
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
                        placeholder={metadataLoading ? "Extracting title…" : "Untitled save"}
                        disabled={metadataLoading}
                        className="velvet-field w-full rounded-xl px-4 py-3 font-display text-2xl leading-[1.15] text-on-surface disabled:opacity-60 sm:text-3xl lg:text-[2rem]"
                        autoComplete="off"
                      />
                    </div>
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
                      onClick={() => {
                        void fetch("/api/affiliate/click", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ item_id: item.id }),
                        })
                          .then((r) => r.json())
                          .then((data: { url?: string }) => {
                            track(ANALYTICS_EVENTS.AFFILIATE_LINK_CLICKED, {
                              item_id: item.id,
                            });
                            window.open(
                              data.url ?? item.source_url!,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          })
                          .catch(() =>
                            window.open(item.source_url!, "_blank", "noopener,noreferrer"),
                          );
                      }}
                    >
                      View source
                    </Button>
                  )}
                  {readOnly && isAuthenticated && (
                    <Button
                      type="button"
                      variant="secondary"
                      icon={Repeat2}
                      onClick={() => setResaveOpen(true)}
                    >
                      Save to my collection
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

              {readOnly && isAuthenticated && (
                <footer className="shrink-0 border-t border-outline-variant/15 bg-surface-container-low/40 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 lg:px-10">
                  <Button
                    type="button"
                    variant="gradient"
                    icon={Repeat2}
                    className="w-full"
                    onClick={() => setResaveOpen(true)}
                  >
                    Save to my collection
                  </Button>
                </footer>
              )}

              {!readOnly && (
                <footer className="shrink-0 border-t border-outline-variant/15 bg-surface-container-low/40 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 lg:px-10">
                  <div className="flex items-center justify-end gap-2">
                    {!canEdit ? (
                      <p className="mr-auto text-xs text-on-surface-variant">
                        View only — editors can change this save.
                      </p>
                    ) : (
                      <>
                        {editing ? (
                          <>
                            <IconButton
                              label="Cancel editing"
                              onClick={cancelEditing}
                              disabled={updateItem.isPending}
                              className="!border-outline-variant/40 !bg-bg-elevated !text-on-surface-variant hover:!bg-surface-container-low disabled:opacity-50"
                            >
                              <XCircle className="h-5 w-5" />
                            </IconButton>
                            <IconButton
                              label="Save changes"
                              onClick={() => void handleSaveEdit()}
                              disabled={updateItem.isPending || metadataLoading}
                              className="!border-primary/40 !bg-primary-fixed/40 !text-primary hover:!bg-primary-fixed/60 disabled:opacity-50"
                            >
                              <Check className="h-5 w-5" />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            label="Edit save"
                            onClick={startEditing}
                            className="!border-outline-variant/40 !bg-bg-elevated !text-primary hover:!bg-primary-fixed/50"
                          >
                            <Pencil className="h-5 w-5" />
                          </IconButton>
                        )}
                        <DestructiveIconButton
                          label="Remove from collection"
                          onClick={handleDelete}
                          disabled={deleteItem.isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </DestructiveIconButton>
                      </>
                    )}
                  </div>
                </footer>
              )}
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
    <ResaveToBoardSheet
      open={resaveOpen}
      itemId={itemId}
      sourceBoardId={boardId || item?.board_id}
      onClose={() => setResaveOpen(false)}
    />
    </>
  );
}
