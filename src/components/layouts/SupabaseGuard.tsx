"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { isSupabaseConfigured } from "@/lib/utils";

export function SupabaseGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isSupabaseConfigured()) {
    return <>{children}</>;
  }

  if (pathname === "/setup") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display mb-4 text-3xl text-on-surface">
        Connect Supabase to use Velvet
      </h1>
      <p className="mb-8 max-w-lg text-on-surface-variant">
        Velvet runs on real data from your Supabase project — no dummy boards or
        items. Add your project URL and anon key, run the SQL migration, then sign
        up to start curating.
      </p>
      <Link href="/setup">
        <Button size="lg">View setup instructions</Button>
      </Link>
    </div>
  );
}
