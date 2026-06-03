"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
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
import { PasswordStrengthIndicator } from "@/components/atoms/PasswordStrengthIndicator";
import { authService } from "@/services/auth/auth.service";
import { signupSchema, type SignupInput } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { isSupabaseConfigured } from "@/lib/utils";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import { ANALYTICS_EVENTS, track, trackError } from "@/lib/analytics";
export function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { mood: "other" },
  });

  const password = watch("password", "");
  const username = watch("username", "");
  const usernameStatus = useUsernameAvailability(username);

  const onSubmit = async (data: SignupInput) => {
    if (!isSupabaseConfigured()) {
      velvetToast.error("Setup required", "Add Supabase keys — see /setup");
      return;
    }

    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      velvetToast.error("Username unavailable", "Choose a different username.");
      return;
    }

    if (usernameStatus === "checking") {
      velvetToast.info("One moment", "Still checking username availability.");
      return;
    }

    const available = await authService.isUsernameAvailable(data.username);
    if (!available) {
      velvetToast.error("Username taken", "That username is already in use.");
      return;
    }

    track(ANALYTICS_EVENTS.SIGNUP_STARTED);
    try {
      const result = await authService.signUp(
        data.email,
        data.password,
        data.fullName,
        data.username,
        data.mood,
      );
      track(ANALYTICS_EVENTS.SIGNUP_COMPLETED);

      if (result.session) {
        velvetToast.success("Welcome to Velvet!", "Let's create your first collection.");
        router.refresh();
        window.location.assign(ROUTES.onboarding);
        return;
      }

      velvetToast.success("Almost there!", "Check your email to verify your account.");
      router.push(`${ROUTES.verifyEmail}?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      trackError(err, { area: "signup" });
      velvetToast.error("Sign up failed", getErrorMessage(err, "auth"));
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

  const usernameHint = (() => {
    if (!username.trim()) return null;
    if (usernameStatus === "checking") {
      return <p className="px-1 text-sm text-[#7A665D]">Checking availability…</p>;
    }
    if (usernameStatus === "available") {
      return (
        <p className="flex items-center gap-1 px-1 text-sm font-medium text-emerald-700">
          <Check className="h-3.5 w-3.5" aria-hidden />
          Available
        </p>
      );
    }
    if (usernameStatus === "taken") {
      return (
        <p className="flex items-center gap-1 px-1 text-sm font-medium text-red-600">
          <X className="h-3.5 w-3.5" aria-hidden />
          Username already taken
        </p>
      );
    }
    if (usernameStatus === "invalid") {
      return (
        <p className="px-1 text-sm text-red-600">
          Use 3–30 characters: lowercase letters, numbers, underscores
        </p>
      );
    }
    return null;
  })();

  return (
    <AuthForm onSubmit={handleSubmit(onSubmit)}>
      <AuthFloatingField
        label="Name"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      <AuthFloatingField
        label="Username"
        autoComplete="username"
        error={errors.username?.message}
        hint={usernameHint}
        {...register("username")}
      />

      <AuthFloatingField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

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

      <AuthPrimaryButton loading={isSubmitting}>Create Account</AuthPrimaryButton>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E9DDD4]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#FAF7F2] px-3 text-[#7A665D] lg:bg-transparent">or</span>
        </div>
      </div>

      <SocialLogin
        analyticsArea="signup"
        onSuccess={() => track(ANALYTICS_EVENTS.SIGNUP_COMPLETED, { method: "google" })}
      />

      <AuthFooter>
        Already have an account?{" "}
        <AuthFooterLink href={ROUTES.login}>Sign in</AuthFooterLink>
      </AuthFooter>
    </AuthForm>
  );
}
