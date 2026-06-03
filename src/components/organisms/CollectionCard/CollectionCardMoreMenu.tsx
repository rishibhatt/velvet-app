"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import { Copy, Ellipsis, ExternalLink, Share2 } from "lucide-react";
import { velvetToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface CollectionCardMoreMenuProps {
  shareUrl: string;
  onView?: () => void;
  className?: string;
}

export function CollectionCardMoreMenu({
  shareUrl,
  onView,
  className,
}: CollectionCardMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      velvetToast.success("Link copied");
    } catch {
      velvetToast.error("Couldn't copy link");
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn("pointer-events-auto relative", className)}>
      <button
        type="button"
        aria-label="More options"
        aria-expanded={open}
        onClick={(e) => {
          stop(e);
          setOpen((v) => !v);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-md backdrop-blur-md transition-transform active:scale-95"
      >
        <Ellipsis className="h-4 w-4" strokeWidth={2.25} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-9 right-0 z-30 min-w-[9.5rem] overflow-hidden rounded-2xl border border-outline-variant/20 bg-bg-elevated py-1 shadow-[var(--shadow-hover)]"
          onClick={stop}
        >
          {onView && (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container-low"
              onClick={() => {
                onView();
                setOpen(false);
              }}
            >
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              View collection
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container-low"
            onClick={() => {
              void copyLink();
            }}
          >
            <Copy className="h-3.5 w-3.5 opacity-70" />
            Copy link
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container-low"
            onClick={() => {
              if (navigator.share) {
                void navigator.share({ url: shareUrl }).catch(() => undefined);
              } else {
                void copyLink();
              }
              setOpen(false);
            }}
          >
            <Share2 className="h-3.5 w-3.5 opacity-70" />
            Share
          </button>
        </div>
      )}
    </div>
  );
}
