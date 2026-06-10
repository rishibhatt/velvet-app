"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import {
  AuthLayout,
  AuthHeader,
  AuthForm,
  AuthFloatingField,
  AuthPrimaryButton,
  AuthFooter,
  AuthFooterLink,
} from "@/components/auth";
import { authService } from "@/services/auth/auth.service";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { isSupabaseConfigured } from "@/lib/utils";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      velvetToast.error("Link expired", "Request a new password reset link.");
    }
  }, [searchParams]);

  const onSubmit = async (data: ForgotPasswordInput) => {
    if (!isSupabaseConfigured()) {
      velvetToast.error("Setup required", "Add Supabase keys — see /setup");
      return;
    }
    try {
      await authService.resetPassword(data.email);
      router.push(`${ROUTES.emailSent}?email=${encodeURIComponent(data.email)}&type=reset`);
    } catch (err) {
      velvetToast.error("Couldn't send email", getErrorMessage(err, "auth"));
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
    <AuthLayout>
      <AuthHeader
        headline="Forgot your password?"
        subtext="We'll send a secure link to restore access."
      />
      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <AuthFloatingField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthPrimaryButton loading={isSubmitting}>Send Reset Link</AuthPrimaryButton>
      </AuthForm>
      <AuthFooter className="mt-6">
        <AuthFooterLink href={ROUTES.login}>Back to sign in</AuthFooterLink>
      </AuthFooter>
    </AuthLayout>
  );
}
