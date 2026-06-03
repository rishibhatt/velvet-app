"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/atoms/Button";
import { authService } from "@/services/auth/auth.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { isSupabaseConfigured } from "@/lib/utils";

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await authService.resendVerificationEmail();
      setSent(true);
      velvetToast.success("Email sent", "Check your inbox for the verification link.");
    } catch (err) {
      velvetToast.error("Couldn't send email", getErrorMessage(err, "auth"));
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <AuthLayout>
        <p className="text-center text-on-surface-variant">
          Connect Supabase first.{" "}
          <Link href="/setup" className="font-semibold text-primary underline">
            Setup guide
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container/30">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display mb-2 text-4xl text-on-surface">
          Verify your email
        </h1>
        <p className="text-on-surface-variant">
          We sent a verification link to{" "}
          <span className="font-medium text-on-surface">
            {user?.email ?? "your email"}
          </span>
          . Click the link to unlock your Velvet account.
        </p>
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          size="lg"
          className="w-full"
          loading={loading}
          onClick={() => void handleResend()}
        >
          {sent ? "Resend again" : "Resend verification email"}
        </Button>
        <p className="text-center text-sm text-on-surface-variant">
          Check your spam folder if you don&apos;t see it within a few minutes.
        </p>
        <p className="text-center text-sm">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => void authService.signOut().then(() => {
              window.location.assign(ROUTES.login);
            })}
          >
            Sign out and use a different email
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
