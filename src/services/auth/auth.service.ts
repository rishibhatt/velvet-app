import { getAuthCallbackUrl, getLoginUrl, getOnboardingUrl } from "@/lib/app-url";
import { requireSupabase } from "@/lib/supabase-errors";
import { isSupabaseConfigured } from "@/lib/utils";
import { createClient } from "@/services/supabase/client";
import type { Profile } from "@/types/board.types";
import type { Database } from "@/types/database.types";

export const authService = {
  async getSession() {
    if (!isSupabaseConfigured()) return { user: null, session: null };
    const supabase = createClient();
    return supabase.auth.getSession().then((r) => r.data);
  },

  async signIn(email: string, password: string) {
    requireSupabase();
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, fullName: string) {
    requireSupabase();
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: getOnboardingUrl(),
      },
    });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    requireSupabase();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(),
      },
    });
    if (error) throw error;
  },

  async signOut() {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    requireSupabase();
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getLoginUrl(),
    });
    if (error) throw error;
  },

  async getProfile(userId?: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) return null;
    requireSupabase();
    const supabase = createClient();
    const id =
      userId ?? (await supabase.auth.getUser()).data.user?.id ?? undefined;
    if (!id) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(updates: Partial<Profile>) {
    requireSupabase();
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates as Database["public"]["Tables"]["profiles"]["Update"])
      .eq("id", userData.user.id)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },
};
