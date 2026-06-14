"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Current path + query for post-login return (preserves UTMs). */
export function useReturnPath(fallback = ROUTES.explore): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const path = pathname || fallback;
  return query ? `${path}?${query}` : path;
}
