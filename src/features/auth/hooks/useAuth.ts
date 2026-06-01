"use client";

import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";
import { authService } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { isSupabaseConfigured } from "@/lib/utils";

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, session, setUser, setSession, clearAuth } = useAuthStore();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => authService.getProfile(user!.id),
    enabled: Boolean(user?.id) && isSupabaseConfigured(),
    meta: { skipErrorToast: true },
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (!newSession) clearAuth();
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, clearAuth]);

  const signOut = useCallback(async () => {
    await authService.signOut();
    clearAuth();
    queryClient.clear();
  }, [clearAuth, queryClient]);

  return {
    user,
    session,
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    isAuthenticated: Boolean(user),
    signOut,
    refreshProfile: () => profileQuery.refetch(),
  };
}
