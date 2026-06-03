"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/atoms/Button";
import { PasswordInput } from "@/components/atoms/PasswordInput";
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
      velvetToast.success("Password updated", "You can now sign in with your new password.");
      await authService.signOut();
      router.push(ROUTES.login);
    } catch (err) {
      velvetToast.error("Couldn't reset password", getErrorMessage(err, "auth"));
    }
  };

  if (!ready) return null;

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

  if (!sessionValid) {
    return (
      <AuthLayout>
        <div className="mb-8">
          <h1 className="font-display mb-2 text-4xl text-on-surface">
            Link expired
          </h1>
          <p className="text-on-surface-variant">
            Request a new password reset link to continue.
          </p>
        </div>
        <Link href={ROUTES.forgotPassword}>
          <Button size="lg" className="w-full">
            Request new link
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display mb-2 text-4xl text-on-surface">
          Set new password
        </h1>
        <p className="text-on-surface-variant">
          Choose a strong password for your account.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            New password
          </label>
          <PasswordInput
            id="password"
            {...register("password")}
            placeholder="••••••••"
          />
          <PasswordStrengthIndicator password={password} className="mt-2" />
          {errors.password && (
            <p className="mt-1 text-sm text-error">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium"
          >
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            {...register("confirmPassword")}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
