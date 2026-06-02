"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Home, Compass, User } from "lucide-react";
import { VelvetLogo } from "@/components/atoms/VelvetLogo";
import { ProfileMenu } from "@/components/molecules/ProfileMenu";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useState, FormEvent } from "react";

const navLinks = [
  { href: ROUTES.home, label: "Home", icon: Home },
  { href: ROUTES.explore, label: "Explore", icon: Compass },
  { href: ROUTES.search, label: "Search", icon: Search },
];

const mobileNav = [
  { href: ROUTES.home, label: "Home", icon: Home },
  { href: ROUTES.explore, label: "Explore", icon: Compass },
  { href: ROUTES.search, label: "Search", icon: Search },
  { href: ROUTES.profile, label: "Profile", icon: User },
];

function isNavLinkActive(pathname: string, href: string) {
  if (href === ROUTES.home) return pathname === ROUTES.home;
  if (href === ROUTES.explore) return pathname.startsWith("/explore");
  if (href === ROUTES.search) return pathname.startsWith("/search");
  if (href === ROUTES.profile) return pathname.startsWith("/profile");
  return pathname === href;
}

const desktopNavLinkClass = (active: boolean) =>
  cn(
    "rounded-xl px-4 py-2 text-sm transition-all",
    active
      ? "velvet-nav-pill-active font-bold text-primary shadow-sm"
      : "font-medium text-on-surface hover:bg-surface-container-low hover:text-primary",
  );

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const goToSearch = (query: string) => {
    const q = query.trim();
    router.push(q ? `${ROUTES.search}?q=${encodeURIComponent(q)}` : ROUTES.search);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    goToSearch(searchQuery);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-bg-elevated/95 shadow-sm backdrop-blur-md">
        <div className="page-container flex h-14 min-h-14 items-center justify-between sm:h-16">
          <div className="flex items-center gap-3 md:gap-10">
            <VelvetLogo variant="nav" priority />
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const active = isNavLinkActive(pathname, link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={desktopNavLinkClass(active)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections or people..."
                className="w-64 rounded-full border border-outline-variant/30 bg-surface-container-lowest py-2 pr-4 pl-10 text-sm text-on-surface shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                aria-label="Search collections"
              />
            </form>
            <Link
              href={ROUTES.search}
              className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-stretch justify-around border-t border-outline-variant/20 bg-bg-elevated/98 px-1 py-1 pb-safe backdrop-blur-md md:hidden">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active = isNavLinkActive(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "mx-0.5 flex min-h-[52px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors",
                active
                  ? "velvet-nav-pill-active text-primary"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={active ? 2.25 : 2}
                fill="none"
              />
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide uppercase",
                  active && "text-primary",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
