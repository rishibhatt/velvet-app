"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Home, LayoutDashboard, User, Activity } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";

const navLinks = [
  { href: ROUTES.home, label: "Home", icon: Home },
  { href: ROUTES.home, label: "Boards", icon: LayoutDashboard },
  { href: ROUTES.search, label: "Explore", icon: Search },
];

const mobileNav = [
  { href: ROUTES.home, label: "Home", icon: Home },
  { href: ROUTES.home, label: "Boards", icon: LayoutDashboard },
  { href: ROUTES.search, label: "Activity", icon: Activity },
  { href: ROUTES.profile, label: "Profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/40 bg-surface/80 shadow-sm backdrop-blur-xl">
        <div className="page-container flex h-14 min-h-14 items-center justify-between sm:h-16">
          <div className="flex items-center gap-3 md:gap-10">
            <Link
              href={ROUTES.home}
              className="font-display text-xl tracking-tight text-primary sm:text-2xl md:text-3xl"
            >
              Velvet
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "font-medium transition-colors hover:text-primary",
                    pathname === link.href
                      ? "font-bold text-primary"
                      : "text-on-surface",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="search"
                placeholder="Search your collections..."
                className="w-64 rounded-full border border-outline-variant/30 bg-white py-2 pr-4 pl-10 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                aria-label="Search collections"
              />
            </div>
            <button
              className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="hidden rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low md:block"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <Link href={ROUTES.profile}>
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name ?? profile?.username}
                size="sm"
                className="cursor-pointer transition-transform hover:scale-105"
              />
            </Link>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-stretch justify-around border-t border-white/40 bg-surface/95 px-1 py-1 pb-safe backdrop-blur-xl md:hidden">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex min-h-[52px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                active
                  ? "text-primary"
                  : "text-on-surface-variant",
              )}
            >
              <Icon className="h-5 w-5" fill={active ? "currentColor" : "none"} />
              <span className="text-[10px] font-semibold tracking-wide uppercase">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
