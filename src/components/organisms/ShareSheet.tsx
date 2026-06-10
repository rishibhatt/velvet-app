"use client";

import { Copy, Share2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import { CollectionPosterGrid } from "@/components/molecules/CollectionPosterGrid";
import { useModalStore } from "@/store/modal.store";
import { shareOrCopy } from "@/lib/share";
import { velvetToast } from "@/lib/toast";
import { BRAND } from "@/constants/brand";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { scaleIn } from "@/lib/animations";

export function ShareSheet() {
  const { shareSheet, closeShareSheet } = useModalStore();
  const { open, url, title, text, imageUrl, imageUrls, eyebrow } = shareSheet;
  useBodyScrollLock(open);

  if (!open || !url) return null;

  const previewImages =
    imageUrls?.filter(Boolean).slice(0, 4) ??
    (imageUrl ? [imageUrl] : []);
  const shareTitle = title ?? BRAND.name;
  const shareText = [eyebrow, text].filter(Boolean).join(" - ");

  const handleNativeShare = async () => {
    const ok = await shareOrCopy({
      url,
      title: shareTitle,
      text: shareText || text,
    });
    if (ok) closeShareSheet();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      velvetToast.success("Link copied!", "Paste it in Messages, Instagram, or anywhere.");
      closeShareSheet();
    } catch {
      velvetToast.error("Couldn't copy", "Allow clipboard access and try again.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="share-sheet"
        className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2a1f1f]/45 p-0 backdrop-blur-md sm:items-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeShareSheet}
      >
        <motion.section
          {...scaleIn}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-sheet-title"
          className="relative flex max-h-[min(82dvh,680px)] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-outline-variant/20 bg-bg-elevated shadow-[var(--shadow-modal)] sm:max-h-[min(88vh,680px)] sm:w-[440px] sm:rounded-[2rem]"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="relative shrink-0 border-b border-outline-variant/20 px-5 py-4 pr-14 sm:px-6">
            <h2 id="share-sheet-title" className="font-display text-xl text-on-surface sm:text-2xl">
              Share
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Preview how your link may look when shared
            </p>
            <button
              type="button"
              onClick={closeShareSheet}
              className="absolute top-4 right-4 rounded-full bg-surface-container-low p-2.5 text-on-surface-variant ring-1 ring-outline-variant/25 transition hover:bg-primary/10 hover:text-primary"
              aria-label="Close share preview"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] custom-scrollbar sm:px-6 sm:py-5">
            <div className="overflow-hidden rounded-3xl border border-outline-variant/25 bg-bg-elevated shadow-[var(--shadow-card)] sm:rounded-[1.75rem]">
              <div className="relative aspect-[1.91/1] w-full overflow-hidden bg-surface-container">
                {previewImages.length > 0 ? (
                  previewImages.length === 1 ? (
                    <VelvetImage
                      src={previewImages[0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  ) : (
                    <CollectionPosterGrid
                      images={previewImages}
                      title={shareTitle}
                      emptyVariant="other"
                      className="h-full"
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-fixed/40 via-accent-blush/30 to-accent-lavender/40">
                    <span className="font-display text-2xl text-primary">{BRAND.name}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 border-t border-outline-variant/15 px-4 py-3.5">
                {eyebrow && (
                  <p className="text-[10px] font-bold tracking-[0.18em] text-primary uppercase">
                    {eyebrow}
                  </p>
                )}
                <p className="font-display line-clamp-2 text-lg leading-snug text-on-surface">
                  {shareTitle}
                </p>
                {text && (
                  <p className="line-clamp-2 text-sm text-on-surface-variant">{text}</p>
                )}
                <p className="truncate pt-1 font-mono text-[11px] text-on-surface-variant">{url}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 sm:gap-3">
              <Button
                variant="gradient"
                icon={Share2}
                className="w-full shadow-md"
                onClick={() => void handleNativeShare()}
              >
                Share...
              </Button>
              <Button
                variant="secondary"
                icon={Copy}
                className="w-full bg-bg-elevated"
                onClick={() => void handleCopy()}
              >
                Copy link
              </Button>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
