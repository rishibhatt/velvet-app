"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AuthLayout,
  SuccessState,
  AuthPrimaryButton,
} from "@/components/auth";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordSuccessPage() {
  const router = useRouter();

  return (
    <AuthLayout centered>
      <SuccessState
        icon={<CheckCircle2 className="h-10 w-10 text-[#B96F5E]" strokeWidth={1.5} />}
        headline="Password updated."
        description="Your account is secure again. Sign in with your new password."
      >
        <AuthPrimaryButton type="button" onClick={() => router.push(ROUTES.login)}>
          Continue to Login
        </AuthPrimaryButton>
      </SuccessState>
    </AuthLayout>
  );
}
