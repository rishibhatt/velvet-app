"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import {
  AuthLayout,
  AuthHeader,
  AuthPrimaryButton,
  AuthOutlinedButton,
  AuthFooter,
  AuthFooterLink,
} from "@/components/auth";
import { authService } from "@/services/auth/auth.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createClient } from "@/services/supabase/client";
import { ROUTES } from "@/constants/routes";
import { isSupabaseConfigured } from "@/lib/utils";

export function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const email = searchParams.get("email") ?? user?.email ?? "your email";

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const interval = setInterval(() => {
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user?.email_confirmed_at) {
          router.replace(ROUTES.emailVerified);
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [router]);

  const handleResend = async () => {
    setLoading(true);
    try {
      await authService.resendVerificationEmail();
      velvetToast.success("Email sent", "Check your inbox for the verification link.");
      router.push(`${ROUTES.emailSent}?email=${encodeURIComponent(email)}&type=verify`);
    } catch (err) {
      velvetToast.error("Couldn't send email", getErrorMessage(err, "auth"));
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <AuthLayout>
        <p className="text-center text-[#7A665D]">
          Connect Supabase first.{" "}
          <Link href="/setup" className="font-semibold text-[#B96F5E] underline">
            Setup guide
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout centered>
      <AuthHeader
        align="center"
        showLogo={false}
        headline="Verify your email."
        subtext="We're waiting for confirmation."
      />

      <div className="mb-8 flex flex-col items-center text-center">
        <motion.div
          className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#E9DDD4] bg-[#FFFCF8]"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#B96F5E]/30"
            animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <Mail className="h-9 w-9 text-[#B96F5E]" strokeWidth={1.5} />
        </motion.div>
        <p className="text-base text-[#7A665D]">
          We sent a verification link to{" "}
          <span className="font-semibold text-[#2D1E1A]">{email}</span>.
        </p>
        <p className="mt-2 text-sm text-[#7A665D]/90">
          This page refreshes automatically when you confirm.
        </p>
      </div>

      <div className="space-y-3">
        <AuthPrimaryButton type="button" loading={loading} onClick={() => void handleResend()}>
          Resend verification email
        </AuthPrimaryButton>
        <AuthOutlinedButton
          type="button"
          onClick={() =>
            void authService.signOut().then(() => {
              window.location.assign(ROUTES.login);
            })
          }
        >
          Sign out
        </AuthOutlinedButton>
      </div>

      <AuthFooter className="mt-8">
        <AuthFooterLink href={ROUTES.login}>Back to sign in</AuthFooterLink>
      </AuthFooter>
    </AuthLayout>
  );
}
