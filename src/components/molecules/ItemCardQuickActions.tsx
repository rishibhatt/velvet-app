"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  Ellipsis,
  ExternalLink,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { confirmAction } from "@/lib/confirm";
import { getItemResourceUrl, getItemShareUrl } from "@/lib/item-resource";
import { shareOrCopy } from "@/lib/share";
import { cn } from "@/lib/utils";
import { useDeleteItem } from "@/queries/item/mutations";
import type { Item } from "@/types/board.types";

export interface ItemCardQuickActionsProps {
  item: Item;
  boardId?: string;
  canEdit?: boolean;
  onEdit?: (item: Item) => void;
  className?: string;
}

const GLASS_CHIP =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white shadow-md backdrop-blur-md transition hover:bg-black/60 active:scale-95 touch-manipulation";

const MENU_ITEM =
  "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-medium text-on-surface transition hover:bg-surface-container-low";

export function ItemCardQuickActions({
  item,
  boardId,
  canEdit = false,
  onEdit,
  className,
}: ItemCardQuickActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const resourceUrl = getItemResourceUrl(item);
  const deleteItem = useDeleteItem(boardId ?? "");

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleShare = (e: MouseEvent) => {
    stop(e);
    void shareOrCopy({
      title: item.title ?? "Velvet save",
      text: item.title ?? undefined,
      url: getItemShareUrl(item),
    });
  };

  const handleEdit = (e: MouseEvent) => {
    stop(e);
    setMenuOpen(false);
    onEdit?.(item);
  };

  const handleDelete = async (e: MouseEvent) => {
    stop(e);
    setMenuOpen(false);
    if (!boardId || !canEdit) return;

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
    } catch {
      /* mutation toast */
    }
  };

  const showMoreMenu =
    Boolean(resourceUrl) || (canEdit && boardId);

  return (
    <div
      ref={ref}
      className={cn("pointer-events-auto relative flex items-center gap-1", className)}
      onClick={stop}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Share"
        title="Share"
        className={GLASS_CHIP}
        onClick={handleShare}
      >
        <Share2 className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>

      {canEdit && onEdit && (
        <button
          type="button"
          aria-label="Edit"
          title="Edit"
          className={GLASS_CHIP}
          onClick={handleEdit}
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      )}

      {showMoreMenu && (
        <>
          <button
            type="button"
            aria-label="More options"
            aria-expanded={menuOpen}
            title="More options"
            className={GLASS_CHIP}
            onClick={(e) => {
              stop(e);
              setMenuOpen((open) => !open);
            }}
          >
            <Ellipsis className="h-4 w-4" strokeWidth={2.25} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute top-9 right-0 z-30 min-w-[10.5rem] overflow-hidden rounded-2xl border border-outline-variant/20 bg-bg-elevated py-1 shadow-[var(--shadow-hover)]"
              onClick={stop}
            >
              {resourceUrl && (
                <a
                  href={resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  className={MENU_ITEM}
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  View source
                </a>
              )}

              <button
                type="button"
                role="menuitem"
                className={MENU_ITEM}
                onClick={(e) => {
                  handleShare(e);
                  setMenuOpen(false);
                }}
              >
                <Share2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
                Share
              </button>

              {canEdit && onEdit && (
                <button
                  type="button"
                  role="menuitem"
                  className={MENU_ITEM}
                  onClick={handleEdit}
                >
                  <Pencil className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  Edit
                </button>
              )}

              {canEdit && boardId && (
                <button
                  type="button"
                  role="menuitem"
                  className={cn(MENU_ITEM, "text-error hover:bg-error/10")}
                  onClick={(e) => void handleDelete(e)}
                  disabled={deleteItem.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0 opacity-90" />
                  Delete
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
