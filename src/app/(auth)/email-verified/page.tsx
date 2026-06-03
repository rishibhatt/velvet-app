"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  AuthLayout,
  SuccessState,
  AuthPrimaryButton,
} from "@/components/auth";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function EmailVerifiedPage() {
  const router = useRouter();
  const { user, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;
    if (user?.email_confirmed_at) return;
    const timer = setTimeout(() => router.replace(ROUTES.verifyEmail), 2000);
    return () => clearTimeout(timer);
  }, [isAuthReady, user?.email_confirmed_at, router]);

  return (
    <AuthLayout centered>
      <SuccessState
        icon={<CheckCircle2 className="h-10 w-10 text-[#B96F5E]" strokeWidth={1.5} />}
        headline="Welcome to Velvet."
        description="Your account is ready. Start collecting what inspires you."
      >
        <AuthPrimaryButton
          type="button"
          onClick={() => router.push(user ? ROUTES.onboarding : ROUTES.login)}
        >
          Go to Velvet
        </AuthPrimaryButton>
      </SuccessState>
    </AuthLayout>
  );
}
