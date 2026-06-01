import { parseSupabaseError } from "@/lib/supabase-errors";

export type ErrorContext =
  | "auth"
  | "board"
  | "item"
  | "upload"
  | "profile"
  | "comment"
  | "generic";

const contextMessages: Record<ErrorContext, string> = {
  auth: "We couldn't sign you in. Check your email and password.",
  board: "Something went wrong with this collection.",
  item: "We couldn't save or load this item.",
  upload: "The image didn't upload. Try a smaller file or check Storage settings.",
  profile: "Your profile couldn't be updated.",
  comment: "Your comment couldn't be posted.",
  generic: "Something went wrong. Please try again.",
};

/** User-facing message from any thrown value or Supabase error. */
export function getErrorMessage(
  error: unknown,
  context: ErrorContext = "generic",
): string {
  const parsed = parseSupabaseError(error);
  if (parsed && parsed !== "Something went wrong. Please try again.") {
    return parsed;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return contextMessages[context];
}

export function isNetworkError(error: unknown): boolean {
  const msg = getErrorMessage(error).toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("load failed")
  );
}
