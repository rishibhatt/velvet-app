import Image from "next/image";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/format";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-24 w-24 text-lg",
};

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full ring-2 ring-surface",
          sizes[size],
          className,
        )}
      >
        <Image src={src} alt={alt ?? name ?? "Avatar"} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-secondary-fixed font-bold text-on-secondary-fixed-variant ring-2 ring-surface",
        sizes[size],
        className,
      )}
      aria-label={name ?? "User avatar"}
    >
      {getInitials(name)}
    </div>
  );
}
