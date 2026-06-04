"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { VelvetLogo } from "@/components/atoms/VelvetLogo";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { loginWithReturn, signupWithReturn } from "@/lib/auth-redirect-path";

const guestMobileNav = [
  { href: ROUTES.explore, label: "Explore", icon: Compass },
] as const;

export function PublicNavbar() {
  const pathname = usePathname();
  const returnPath = pathname || ROUTES.explore;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-bg-elevated/95 shadow-sm backdrop-blur-md">
        <div className="page-container flex h-14 min-h-14 items-center justify-between sm:h-16">
          <div className="flex items-center gap-3">
            <VelvetLogo variant="nav" href={ROUTES.explore} priority />
            <Link
              href={ROUTES.explore}
              aria-current={pathname.startsWith("/explore") ? "page" : undefined}
              className={cn(
                "hidden rounded-xl px-3 py-2 text-sm font-semibold transition-colors sm:inline-flex",
                pathname.startsWith("/explore")
                  ? "velvet-nav-pill-active text-primary"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              Explore
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={loginWithReturn(returnPath)} className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href={signupWithReturn(returnPath)}>
              <Button variant="gradient" size="sm">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-stretch justify-around border-t border-outline-variant/20 bg-bg-elevated/98 px-2 py-1 pb-safe backdrop-blur-md md:hidden">
        {guestMobileNav.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex min-h-[52px] min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors",
                active
                  ? "velvet-nav-pill-active text-primary"
                  : "text-on-surface-variant",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href={loginWithReturn(returnPath)}
          className="flex min-h-[52px] min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-on-surface-variant"
        >
          <span className="text-sm font-bold text-primary">Log in</span>
        </Link>
      </nav>
    </>
  );
}
