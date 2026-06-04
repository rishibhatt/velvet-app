"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import {
  AuthForm,
  AuthFloatingField,
  AuthPasswordField,
  AuthPrimaryButton,
  AuthFooter,
  AuthFooterLink,
  SocialLogin,
} from "@/components/auth";
import { authService } from "@/services/auth/auth.service";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { getSafeReturnPath } from "@/lib/auth-redirect-path";
import { isSupabaseConfigured } from "@/lib/utils";
import { ANALYTICS_EVENTS, track, trackError } from "@/lib/analytics";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      velvetToast.error(
        "Sign in failed",
        "Your link may have expired. Try signing in again or request a new link.",
      );
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginInput) => {
    if (!isSupabaseConfigured()) {
      velvetToast.error("Setup required", "Add Supabase keys in .env.local — see /setup");
      return;
    }
    try {
      await authService.signIn(data.email, data.password);
      track(ANALYTICS_EVENTS.LOGIN_COMPLETED, { method: "password" });
      velvetToast.success("Welcome back!", "Your inspiration space is waiting.");
      const next = getSafeReturnPath(searchParams.get("next"));
      router.refresh();
      window.location.assign(next);
    } catch (err) {
      trackError(err, { area: "login", method: "password" });
      velvetToast.error("Sign in failed", getErrorMessage(err, "auth"));
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-center text-[#7A665D]">
        Connect Supabase first.{" "}
        <Link href="/setup" className="font-semibold text-[#B96F5E] underline">
          Setup guide
        </Link>
      </p>
    );
  }

  return (
    <AuthForm onSubmit={handleSubmit(onSubmit)}>
      <AuthFloatingField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <AuthPasswordField
        label="Password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="text-right">
        <Link
          href={ROUTES.forgotPassword}
          className="text-sm font-medium text-[#B96F5E] hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <AuthPrimaryButton loading={isSubmitting}>Sign In</AuthPrimaryButton>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E9DDD4]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#FAF7F2] px-3 text-[#7A665D] lg:bg-transparent">or</span>
        </div>
      </div>

      <SocialLogin
        analyticsArea="login"
        onSuccess={() => track(ANALYTICS_EVENTS.LOGIN_COMPLETED, { method: "google" })}
      />

      <AuthFooter>
        New to Velvet? <AuthFooterLink href={ROUTES.signup}>Create Account</AuthFooterLink>
      </AuthFooter>
    </AuthForm>
  );
}
