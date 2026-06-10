"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import {
  AuthLayout,
  AuthHeader,
  AuthForm,
  AuthPasswordField,
  AuthPrimaryButton,
  AuthFooter,
  AuthFooterLink,
} from "@/components/auth";
import { PasswordStrengthIndicator } from "@/components/atoms/PasswordStrengthIndicator";
import { authService } from "@/services/auth/auth.service";
import { createClient } from "@/services/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { isSupabaseConfigured } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSessionValid(Boolean(data.session));
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setSessionValid(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await authService.updatePassword(data.password);
      velvetToast.success("Password updated", "Your account is secure again.");
      await authService.signOut();
      router.push(ROUTES.resetPasswordSuccess);
    } catch (err) {
      velvetToast.error("Couldn't reset password", getErrorMessage(err, "auth"));
    }
  };

  if (!ready) return null;

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

  if (!sessionValid) {
    return (
      <AuthLayout>
        <AuthHeader
          headline="Link expired"
          subtext="Request a new password reset link to continue."
        />
        <AuthPrimaryButton type="button" onClick={() => router.push(ROUTES.forgotPassword)}>
          Request new link
        </AuthPrimaryButton>
        <AuthFooter className="mt-6">
          <AuthFooterLink href={ROUTES.login}>Back to sign in</AuthFooterLink>
        </AuthFooter>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeader
        headline="Create a new password."
        subtext="Choose a strong password you'll remember."
      />
      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <AuthPasswordField
          label="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrengthIndicator password={password} className="px-1" />

        <AuthPasswordField
          label="Confirm Password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <AuthPrimaryButton loading={isSubmitting}>Update password</AuthPrimaryButton>
      </AuthForm>
    </AuthLayout>
  );
}
