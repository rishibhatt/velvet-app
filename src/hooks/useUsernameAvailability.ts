"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/auth/auth.service";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function useUsernameAvailability(username: string, debounceMs = 400) {
  const [status, setStatus] = useState<UsernameStatus>("idle");

  useEffect(() => {
    const normalized = username.trim().toLowerCase();
    if (!normalized) {
      setStatus("idle");
      return;
    }

    if (!/^[a-z0-9_]{3,30}$/.test(normalized)) {
      setStatus("invalid");
      return;
    }

    setStatus("checking");
    const timer = setTimeout(() => {
      void authService.isUsernameAvailable(normalized).then((available) => {
        setStatus(available ? "available" : "taken");
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [username, debounceMs]);

  return status;
}
