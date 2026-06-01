"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageBackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function PageBackButton({
  href,
  label = "Back",
  className,
}: PageBackButtonProps) {
  const router = useRouter();

  const classes = cn(
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-outline-variant/30 bg-bg-elevated/95 px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:border-primary/30 hover:bg-primary-fixed/30 active:scale-[0.98]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={classes}>
      <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
      {label}
    </button>
  );
}
