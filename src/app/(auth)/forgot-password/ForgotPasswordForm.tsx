"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/atoms/Button";
import { authService } from "@/services/auth/auth.service";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { isSupabaseConfigured } from "@/lib/utils";

export default function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

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
      setSentEmail(data.email);
      setSent(true);
      velvetToast.success("Email sent", "Check your inbox for reset instructions.");
    } catch (err) {
      velvetToast.error("Couldn't send email", getErrorMessage(err, "auth"));
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="mb-8">
          <h1 className="font-display mb-2 text-4xl text-on-surface">
            Check your email
          </h1>
          <p className="text-on-surface-variant">
            We sent a reset link to{" "}
            <span className="font-medium text-on-surface">{sentEmail}</span>.
            Click the link to set a new password.
          </p>
          <p className="mt-4 text-sm text-on-surface-variant">
            Don&apos;t see it? Check your spam folder or try again in a few minutes.
          </p>
        </div>
        <Link href={ROUTES.login}>
          <Button size="lg" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display mb-2 text-4xl text-on-surface">
          Reset password
        </h1>
        <p className="text-on-surface-variant">
          We&apos;ll send you a link to reset your password.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-3 focus:border-primary focus:outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Send Reset Link
        </Button>
        <p className="text-center text-sm">
          <Link href={ROUTES.login} className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
