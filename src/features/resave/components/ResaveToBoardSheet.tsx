"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { Button } from "@/components/atoms/Button";
import { useBoards } from "@/queries/board/queries";
import { useModalStore } from "@/store/modal.store";
import { velvetToast } from "@/lib/toast";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { boardKeys } from "@/queries/board/keys";

interface ResaveToBoardSheetProps {
  open: boolean;
  itemId: string;
  /** Board the item currently lives on — excluded from destination list */
  sourceBoardId?: string;
  onClose: () => void;
}

export function ResaveToBoardSheet({
  open,
  itemId,
  sourceBoardId,
  onClose,
}: ResaveToBoardSheetProps) {
  const { data: boards = [], isLoading } = useBoards();
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();
  const openCreateBoard = useModalStore((s) => s.openCreateBoard);

  const destinationBoards = useMemo(
    () => boards.filter((b) => b.id !== sourceBoardId),
    [boards, sourceBoardId],
  );

  const handleSelect = async (boardId: string) => {
    if (!itemId) return;
    setPending(true);
    try {
      const res = await fetch(`/api/items/${itemId}/resave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_board_id: boardId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        item?: { id: string };
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Couldn't save to that collection.");
      }
      track(ANALYTICS_EVENTS.ITEM_RESAVED, {
        original_item_id: itemId,
        target_board_id: boardId,
      });
      await queryClient.invalidateQueries({ queryKey: boardKeys.all });
      velvetToast.success("Saved!", "Added to your collection.");
      onClose();
    } catch (err) {
      velvetToast.error(
        "Couldn't save",
        err instanceof Error ? err.message : "Try again in a moment.",
      );
    } finally {
      setPending(false);
    }
  };

  if (!itemId) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="resave-to-board-sheet"
          className="fixed inset-0 z-[110] flex items-end justify-center bg-inverse-surface/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg rounded-t-3xl bg-bg-elevated p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display mb-1 text-lg text-on-surface">Save to which collection?</h2>
            <p className="mb-4 text-sm text-on-surface-variant">
              A copy will be added to your board with credit to the original creator.
            </p>
            {isLoading ? (
              <p className="text-sm text-on-surface-variant">Loading your collections...</p>
            ) : destinationBoards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low/60 px-4 py-8 text-center">
                <p className="text-sm text-on-surface-variant">
                  Create a collection first, then you can save items from the community.
                </p>
                <Button
                  type="button"
                  variant="gradient"
                  icon={Plus}
                  className="mt-4"
                  onClick={() => {
                    onClose();
                    openCreateBoard();
                  }}
                >
                  New collection
                </Button>
              </div>
            ) : (
              <ul className="max-h-[50dvh] space-y-2 overflow-y-auto custom-scrollbar">
                {destinationBoards.map((board) => (
                  <li key={board.id}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void handleSelect(board.id)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-outline-variant/15 p-3 text-left transition-colors hover:bg-surface-container-low disabled:opacity-60"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container-low">
                        {board.cover_url && (
                          <VelvetImage
                            src={board.cover_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        )}
                      </div>
                      <span className="truncate font-semibold text-on-surface">{board.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button type="button" variant="secondary" className="mt-4 w-full" onClick={onClose}>
              Cancel
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
