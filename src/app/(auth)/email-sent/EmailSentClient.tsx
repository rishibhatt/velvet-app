"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import {
  AuthLayout,
  SuccessState,
  AuthOutlinedButton,
  AuthPrimaryButton,
  AuthFooter,
  AuthFooterLink,
} from "@/components/auth";
import { authService } from "@/services/auth/auth.service";
import { ROUTES } from "@/constants/routes";
import { isSupabaseConfigured } from "@/lib/utils";

export function EmailSentClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";
  const type = searchParams.get("type") ?? "reset";
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!isSupabaseConfigured() || !email || email === "your email") return;
    setLoading(true);
    try {
      if (type === "reset") {
        await authService.resetPassword(email);
      } else {
        await authService.resendVerificationEmail();
      }
      velvetToast.success("Email sent", "Check your inbox again.");
    } catch (err) {
      velvetToast.error("Couldn't resend", getErrorMessage(err, "auth"));
    } finally {
      setLoading(false);
    }
  };

  const openGmail = () => {
    window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
  };

  return (
    <AuthLayout centered>
      <SuccessState
        icon={<Mail className="h-9 w-9 text-[#B96F5E]" strokeWidth={1.5} />}
        headline="Check your inbox."
        description={
          <>
            We sent a secure link to{" "}
            <span className="font-semibold text-[#2D1E1A]">{email}</span>.
          </>
        }
      >
        <AuthPrimaryButton type="button" onClick={openGmail}>
          Open Gmail
        </AuthPrimaryButton>
        <AuthOutlinedButton type="button" disabled={loading} onClick={() => void handleResend()}>
          {loading ? "Sending…" : "Resend Email"}
        </AuthOutlinedButton>
      </SuccessState>
      <AuthFooter className="mt-8">
        <AuthFooterLink href={ROUTES.login}>Back to sign in</AuthFooterLink>
      </AuthFooter>
    </AuthLayout>
  );
}
