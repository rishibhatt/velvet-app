"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { confirmAction } from "@/lib/confirm";

export function ProfileMenu() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    const ok = await confirmAction({
      title: "Sign out of Velvet?",
      description: "You can sign back in anytime with your account.",
      confirmLabel: "Sign out",
      cancelLabel: "Stay here",
      variant: "destructive",
    });
    if (!ok) return;
    await signOut();
    router.push(ROUTES.login);
    router.refresh();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full transition-transform hover:scale-105 focus-visible:outline-offset-2"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <Avatar
          src={profile?.avatar_url}
          name={profile?.full_name ?? profile?.username}
          size="sm"
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full right-0 z-[60] mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-outline-variant/25 bg-bg-elevated py-1 shadow-[var(--shadow-modal)]",
          )}
          role="menu"
        >
          {profile?.username && (
            <p className="border-b border-outline-variant/20 px-4 py-3 text-sm text-on-surface-variant">
              @{profile.username}
            </p>
          )}
          <Link
            href={ROUTES.profile}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4 text-primary" />
            Profile
          </Link>
          <Link
            href={ROUTES.settings}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4 text-primary" />
            Settings
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-error hover:bg-surface-container-low"
            role="menuitem"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
