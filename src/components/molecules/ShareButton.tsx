"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { shareOrCopy } from "@/lib/share";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  label?: string;
  variant?: "button" | "icon";
  size?: "sm" | "md";
  className?: string;
}

export function ShareButton({
  url,
  title,
  text,
  label = "Share",
  variant = "button",
  size = "sm",
  className,
}: ShareButtonProps) {
  const handleShare = () => {
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
