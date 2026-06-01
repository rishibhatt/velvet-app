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
} from "lucide-react";
import { velvetToast } from "@/lib/toast";
import { Button } from "@/components/atoms/Button";
import { Avatar } from "@/components/atoms/Avatar";
import { SourceBadge } from "@/components/molecules/SourceBadge";
import { useItemDetail } from "@/queries/item/queries";
import { useDeleteItem } from "@/queries/item/mutations";
import {
  useComments,
  useAddComment,
} from "@/queries/comment/queries";
import { useModalStore } from "@/store/modal.store";
import { formatRelativeTime } from "@/utils/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { getPreviewAspectClass } from "@/lib/preview-image";
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
  const aspectClass = getPreviewAspectClass(imageUrl);

  if (imageUrl) {
    return (
      <div className={cn("relative h-full w-full", aspectClass, "md:aspect-auto md:min-h-full")}>
        <VelvetImage
          src={imageUrl}
          alt={title ?? "Saved item"}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  if (type === "note") {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center bg-gradient-to-br from-primary-fixed/50 via-secondary-fixed/30 to-tertiary-fixed/40 p-8 md:min-h-full">
        <p className="font-display max-w-md text-center text-xl leading-snug text-on-surface md:text-2xl">
          {description ?? title}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-[240px] flex-col items-center justify-center gap-4 p-8 md:min-h-full",
        source === "instagram" && "bg-gradient-to-br from-[#fdf2f8] to-[#fce7f3]",
        source === "youtube" && "bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]",
        source === "pinterest" && "bg-gradient-to-br from-tertiary-fixed/40 to-secondary-fixed/30",
        (!source || source === "web" || source === "amazon" || source === "upload") &&
          "bg-gradient-to-br from-surface-container to-primary-fixed/25",
      )}
    >
      <Link2 className="h-10 w-10 text-primary" />
      {source && <SourceBadge source={source} />}
      <p className="font-display text-center text-lg text-on-surface line-clamp-3">
        {title ?? "Saved link"}
      </p>
    </div>
  );
}

export function ItemDetailModal() {
  const { itemModal, closeItemModal } = useModalStore();
  const { data: item } = useItemDetail(itemModal.itemId ?? "");
  const { data: comments = [] } = useComments(itemModal.itemId ?? "");
  const addComment = useAddComment(itemModal.itemId ?? "");
  const deleteItem = useDeleteItem(item?.board_id ?? "");
  const { profile } = useAuth();
  const [commentText, setCommentText] = useState("");

  useBodyScrollLock(itemModal.open);

  const handleShare = async () => {
    if (!item) return;
    const url = item.source_url ?? window.location.href;
    const shareData = {
      title: item.title ?? "Velvet save",
      text: item.title ?? undefined,
      url,
    };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      velvetToast.success("Link copied!", "Paste it anywhere to share.");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      velvetToast.error("Couldn't share", "Try copying the link from View source.");
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm("Remove this item from the collection?")) return;
    try {
      await deleteItem.mutateAsync(item.id);
      closeItemModal();
    } catch {
      /* mutation global toast */
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync(commentText);
      setCommentText("");
    } catch {
      /* toast via mutation cache */
    }
  };

  return (
    <AnimatePresence>
      {itemModal.open && item && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center overflow-hidden bg-inverse-surface/50 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeItemModal}
        >
          <motion.article
            className="relative flex h-[min(100dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-outline-variant/20 bg-bg-elevated shadow-[var(--shadow-modal)] sm:h-auto sm:max-h-[min(92dvh,calc(100dvh-2rem))] sm:rounded-3xl md:flex-row"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview — left on desktop */}
            <div
              className={cn(
                "relative w-full shrink-0 overflow-hidden bg-surface-container md:w-[min(44%,420px)]",
                item.image_url
                  ? getPreviewAspectClass(item.image_url)
                  : "min-h-[36vh] md:min-h-0",
              )}
            >
              <div className="relative h-full min-h-[36vh] w-full md:absolute md:inset-0 md:min-h-full">
                <ItemPreview
                  imageUrl={item.image_url}
                  title={item.title}
                  type={item.type}
                  description={item.description ?? item.notes}
                  source={item.source}
                />
              </div>
            </div>

            {/* Details column */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-bg-elevated">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/20 px-4 py-3 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {item.source && <SourceBadge source={item.source} />}
                  <p className="truncate font-display text-base text-on-surface md:text-lg">
                    {item.title}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
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
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain custom-scrollbar px-5 pb-4 pt-4 sm:px-8">
                <h1 className="font-display sr-only text-2xl leading-tight text-on-surface md:not-sr-only md:mb-2 md:block md:text-3xl">
                  {item.title}
                </h1>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Curated by{" "}
                  <span className="font-semibold text-primary">
                    {profile?.full_name ?? profile?.username ?? "You"}
                  </span>
                  <span className="mx-2 text-outline-variant">·</span>
                  {formatRelativeTime(item.created_at)}
                </p>

                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-md transition hover:opacity-90"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View source
                  </a>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-primary-fixed/60 px-3 py-1 text-xs font-medium text-on-primary-fixed-variant"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {item.notes && (
                  <div className="mt-8 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-5">
                    <h3 className="mb-2 text-xs font-bold tracking-widest text-primary uppercase">
                      Your notes
                    </h3>
                    <p className="text-base leading-relaxed text-on-surface">
                      {item.notes}
                    </p>
                  </div>
                )}

                <section className="mt-10 border-t border-outline-variant/25 pt-8">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-display text-lg text-on-surface">
                      Reflections
                    </h3>
                    <span className="text-xs text-on-surface-variant">
                      {comments.length} {comments.length === 1 ? "comment" : "comments"}
                    </span>
                  </div>

                  <div className="space-y-5">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-3 rounded-xl bg-surface-container-low/80 p-3"
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
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-3">
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
                        className="w-full rounded-xl border border-outline-variant/30 bg-bg-elevated px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
                        aria-label="Add comment"
                      />
                      <button
                        type="button"
                        onClick={handleComment}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-primary hover:bg-primary/10"
                        aria-label="Send comment"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              <footer className="shrink-0 border-t border-outline-variant/20 bg-surface-container-low/50 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
                <Button
                  variant="secondary"
                  className="w-full !border-error/30 !text-error sm:w-auto"
                  onClick={handleDelete}
                  loading={deleteItem.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove from collection
                </Button>
              </footer>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
