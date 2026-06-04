"use client";

import { useEffect, useState } from "react";

/** Collapse floating chrome after scrolling past `threshold` px. */
export function useScrollCompact(threshold = 120) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => setCompact(window.scrollY > threshold);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return compact;
}
