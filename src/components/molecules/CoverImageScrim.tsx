import { cn } from "@/lib/utils";

interface CoverImageScrimProps {
  /** Scrim color at the bottom (readable text band) */
  tone?: "background" | "elevated";
  className?: string;
}

/** Bottom-weighted overlay — keeps cover art visible in the upper area. */
export function CoverImageScrim({
  tone = "background",
  className,
}: CoverImageScrimProps) {
  const fromClass =
    tone === "elevated" ? "from-bg-elevated" : "from-background";
  const viaClass =
    tone === "elevated" ? "via-bg-elevated/80" : "via-background/80";

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-[1]", className)}
      aria-hidden
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/15 to-transparent sm:h-24" />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t to-transparent sm:h-[62%]",
          fromClass,
          viaClass,
        )}
      />
    </div>
  );
}
