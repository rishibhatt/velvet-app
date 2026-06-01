"use client";

import { useState } from "react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Heart,
  ExternalLink,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Avatar } from "@/components/atoms/Avatar";
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

export function ItemDetailModal() {
  const { itemModal, closeItemModal } = useModalStore();
  const { data: item } = useItemDetail(itemModal.itemId ?? "");
  const { data: comments = [] } = useComments(itemModal.itemId ?? "");
  const addComment = useAddComment(itemModal.itemId ?? "");
  const deleteItem = useDeleteItem(item?.board_id ?? "");
  const { profile } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [favorited, setFavorited] = useState(false);

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
          className="fixed inset-0 z-[100] bg-inverse-surface/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeItemModal}
        >
          <motion.main
            className="relative mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-surface-container-lowest shadow-2xl sm:min-h-0 sm:max-h-[95dvh] md:my-8 md:min-h-0 md:rounded-3xl md:glass-panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 z-20 flex w-full items-center justify-between p-6">
              <button
                onClick={closeItemModal}
                className="rounded-full p-2 glass-panel shadow-sm transition-transform hover:scale-105 active:scale-95"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                <button
                  className="rounded-full p-2 glass-panel shadow-sm transition-transform hover:scale-105"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setFavorited(!favorited)}
                  className="rounded-full p-2 glass-panel shadow-sm transition-transform hover:scale-105"
                  aria-label="Favorite"
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      favorited ? "fill-primary text-primary" : "",
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="relative h-[40vh] min-h-[280px] overflow-hidden md:h-[530px]">
              {item.image_url ? (
                <VelvetImage
                  src={item.image_url}
                  alt={item.title ?? ""}
                  fill
                  className="object-cover"
                  priority
                />
              ) : item.type === "note" ? (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-fixed/30 to-secondary-fixed/20 p-12">
                  <p className="font-display max-w-lg text-center text-2xl text-on-surface">
                    {item.description ?? item.notes ?? item.title}
                  </p>
                </div>
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-inverse-surface/40" />
            </div>

            <div className="flex-1 overflow-y-auto bg-surface-container-lowest px-6 py-10 custom-scrollbar md:px-12">
              <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="space-y-2">
                  <h1 className="font-display text-2xl leading-tight text-on-surface md:text-3xl">
                    {item.title}
                  </h1>
                  <p className="text-sm text-on-surface-variant">
                    Curated by{" "}
                    <span className="font-semibold text-primary">
                      {profile?.full_name ?? profile?.username ?? "You"}
                    </span>{" "}
                    • {formatRelativeTime(item.created_at)}
                  </p>
                </div>
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-95 md:self-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Source
                  </a>
                )}
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="cursor-pointer rounded-full bg-surface-container-high px-4 py-1.5 text-xs text-on-surface-variant transition-colors hover:bg-primary-fixed"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {item.notes && (
                <div className="mb-12">
                  <h3 className="mb-2 text-sm font-medium tracking-widest text-primary uppercase">
                    Notes
                  </h3>
                  <p className="max-w-2xl border-l-2 border-primary-fixed-dim py-2 pl-6 font-body text-lg leading-relaxed text-on-surface italic opacity-80">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                </div>
              )}

              <div className="mb-10 h-px w-full bg-outline-variant/30" />

              <section className="space-y-8 pb-12">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl text-on-surface">
                    Community Notes
                  </h3>
                  <span className="text-xs text-on-surface-variant">
                    {comments.length} comments
                  </span>
                </div>

                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar
                        src={comment.profile?.avatar_url}
                        name={comment.profile?.full_name}
                        size="md"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {comment.profile?.full_name}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-on-surface-variant">{comment.content}</p>
                        <div className="flex gap-4 pt-1">
                          <button className="text-xs font-semibold text-primary hover:underline">
                            Reply
                          </button>
                          {comment.likes !== undefined && (
                            <button className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary">
                              <Heart className="h-3 w-3" /> {comment.likes}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Avatar
                    src={profile?.avatar_url}
                    name={profile?.full_name ?? profile?.username}
                    size="md"
                    className="border-2 border-primary-container"
                  />
                  <div className="relative flex-1">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleComment()}
                      placeholder="Add a reflection..."
                      className="w-full border-b-2 border-surface-variant bg-surface-container-low py-2 focus:border-primary-fixed-dim focus:outline-none"
                      aria-label="Add comment"
                    />
                    <button
                      onClick={handleComment}
                      className="absolute top-1/2 right-0 -translate-y-1/2 text-primary transition-transform hover:scale-110"
                      aria-label="Send comment"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <footer className="flex justify-end border-t border-outline-variant/20 bg-surface-container-low/80 p-6 backdrop-blur-lg md:p-8">
              <Button
                variant="secondary"
                className="!border-error/40 !text-error"
                onClick={handleDelete}
                loading={deleteItem.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Remove from collection
              </Button>
            </footer>
          </motion.main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
