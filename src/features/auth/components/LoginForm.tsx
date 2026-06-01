"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/atoms/Button";
import { authService } from "@/services/auth/auth.service";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { isSupabaseConfigured } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    if (!isSupabaseConfigured()) {
      velvetToast.error("Setup required", "Add Supabase keys in .env.local — see /setup");
      return;
    }
    setLoading(true);
    try {
      await authService.signIn(data.email, data.password);
      velvetToast.success("Welcome back!", "Your velvet world awaits.");
      router.refresh();
      // Full navigation so middleware receives fresh auth cookies (needed for ngrok)
      window.location.assign(ROUTES.home);
      return;
    } catch (err) {
      velvetToast.error("Sign in failed", getErrorMessage(err, "auth"));
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-center text-on-surface-variant">
        Connect Supabase first.{" "}
        <Link href="/setup" className="font-semibold text-primary underline">
          Setup guide
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-on-surface-variant">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-3 shadow-[var(--shadow-inner)] transition-all focus:border-primary-fixed-dim focus:ring-2 focus:ring-primary-fixed/30 focus:outline-none"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-error">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-on-surface-variant">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className="w-full rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-3 shadow-[var(--shadow-inner)] transition-all focus:border-primary-fixed-dim focus:ring-2 focus:ring-primary-fixed/30 focus:outline-none"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-error">{errors.password.message}</p>
        )}
      </div>

      <div className="text-right">
        <Link
          href={ROUTES.forgotPassword}
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" variant="gradient" size="lg" loading={loading} className="w-full">
        Sign In
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/30" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-4 text-on-surface-variant">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={() =>
          authService.signInWithGoogle().catch((err) =>
            velvetToast.fromError(err, "auth"),
          )
        }
      >
        Continue with Google
      </Button>

      <p className="text-center text-sm text-on-surface-variant">
        New to Velvet?{" "}
        <Link href={ROUTES.signup} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
