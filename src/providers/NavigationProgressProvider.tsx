"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationProgressContextValue {
  startNavigation: () => void;
  isNavigating: boolean;
}

const NavigationProgressContext =
  createContext<NavigationProgressContextValue | null>(null);

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const previousPath = useRef(pathname);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      setIsNavigating(false);
      previousPath.current = pathname;
    }
  }, [pathname]);

  return (
    <NavigationProgressContext.Provider value={{ startNavigation, isNavigating }}>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[200] overflow-hidden transition-opacity duration-300 ease-out",
          isNavigating ? "opacity-100" : "opacity-0",
        )}
        style={{ height: "5px" }}
        aria-hidden
      >
        <div className="h-full w-full bg-primary/15" />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[42%] rounded-full bg-primary",
            "shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_50%,transparent)]",
            isNavigating && "animate-[velvet-nav-indeterminate_1.35s_cubic-bezier(0.45,0.05,0.25,0.95)_infinite]",
          )}
        />
      </div>
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const ctx = useContext(NavigationProgressContext);
  if (!ctx) {
    return {
      startNavigation: () => {},
      isNavigating: false,
    };
  }
  return ctx;
}
