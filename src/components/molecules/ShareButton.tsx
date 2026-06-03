"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { shareOrCopy } from "@/lib/share";
import { useModalStore } from "@/store/modal.store";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  label?: string;
  variant?: "button" | "icon";
  size?: "sm" | "md";
  className?: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  eyebrow?: string;
  preview?: boolean;
}

export function ShareButton({
  url,
  title,
  text,
  label = "Share",
  variant = "button",
  size = "sm",
  className,
  imageUrl,
  imageUrls,
  eyebrow,
  preview = false,
}: ShareButtonProps) {
  const openShareSheet = useModalStore((s) => s.openShareSheet);

  const handleShare = () => {
    if (preview) {
      openShareSheet({
        url,
        title,
        text,
        imageUrl,
        imageUrls,
        eyebrow,
      });
      return;
    }
    void shareOrCopy({ url, title, text });
  };

  if (variant === "icon") {
    return (
      <IconButton
        label={label}
        onClick={handleShare}
        className={cn(
          "!h-10 !w-10 !min-h-10 !min-w-10 border border-outline-variant/40 bg-bg-elevated text-primary hover:bg-primary-fixed/50 hover:text-primary",
          className,
        )}
      >
        <Share2 className="h-4 w-4" strokeWidth={2.25} />
      </IconButton>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      icon={Share2}
      onClick={handleShare}
      className={cn(
        "border-outline-variant/50 bg-bg-elevated text-on-surface",
        className,
      )}
    >
      {label}
    </Button>
  );
}
