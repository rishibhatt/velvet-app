export class SupabaseServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "SupabaseServiceError";
  }
}

export function parseSupabaseError(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as { message?: string; code?: string; details?: string };
    if (e.code === "42P17") {
      return "Database policy error. Run supabase/migrations/003_fix_rls_and_storage.sql in your Supabase SQL Editor.";
    }
    if (e.code === "42501" || e.message?.includes("row-level security")) {
      return "Permission denied. Run supabase/migrations/008_soft_delete_item_rpc.sql in your Supabase SQL Editor (Dashboard → SQL → New query → paste → Run).";
    }
    if (e.message?.includes("soft_delete_item") || e.message?.includes("Could not find the function")) {
      return "Database update needed. Run supabase/migrations/008_soft_delete_item_rpc.sql in your Supabase SQL Editor.";
    }
    if (e.message) return e.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function requireSupabase() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new SupabaseServiceError(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    );
  }
}
