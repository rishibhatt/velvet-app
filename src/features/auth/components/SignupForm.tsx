"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { velvetToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/atoms/Button";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/atoms/PasswordStrengthIndicator";
import { MOODS } from "@/constants/moods";
import { authService } from "@/services/auth/auth.service";
import { signupSchema, type SignupInput } from "@/schemas/auth.schema";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/utils";
import { ANALYTICS_EVENTS, track, trackError } from "@/lib/analytics";

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] =
    useState<SignupInput["mood"]>("wedding");

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { mood: "wedding" },
  });

  const password = watch("password", "");

  const onSubmit = async (data: SignupInput) => {
    if (!isSupabaseConfigured()) {
      velvetToast.error("Setup required", "Add Supabase keys — see /setup");
      return;
    }
    track(ANALYTICS_EVENTS.SIGNUP_STARTED);
    try {
      const result = await authService.signUp(
        data.email,
        data.password,
        data.fullName,
        selectedMood,
      );
      track(ANALYTICS_EVENTS.SIGNUP_COMPLETED);

      if (result.session) {
        velvetToast.success("Welcome to Velvet!", "Let's create your first collection.");
        router.refresh();
        window.location.assign(ROUTES.onboarding);
        return;
      }

      velvetToast.success(
        "Almost there!",
        "Check your email to verify your account before continuing.",
      );
      router.refresh();
      window.location.assign(ROUTES.verifyEmail);
    } catch (err) {
      trackError(err, { area: "signup" });
      velvetToast.error("Sign up failed", getErrorMessage(err, "auth"));
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

  const nextStep = async () => {
    const valid = await trigger(["fullName", "email", "password"]);
    if (valid) setStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-on-surface-variant">
                Full Name
              </label>
              <input
                id="fullName"
                {...register("fullName")}
                className="w-full rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-3 focus:border-primary focus:outline-none"
                placeholder="Aanya Sharma"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-error">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-on-surface-variant">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-3 focus:border-primary focus:outline-none"
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
            <Button type="button" size="lg" className="w-full" onClick={nextStep}>
              Continue
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <p className="mb-4 font-display text-lg text-on-surface">
                What will you plan first?
              </p>
              <div className="flex flex-wrap gap-3">
                {MOODS.slice(0, 5).map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setSelectedMood(mood.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border-[1.5px] px-5 py-2.5 transition-all",
                      selectedMood === mood.value
                        ? "border-secondary-container bg-secondary-container/20"
                        : "border-transparent bg-surface-container-low",
                    )}
                  >
                    <span>{mood.emoji}</span>
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
              <input type="hidden" {...register("mood")} value={selectedMood} />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button type="submit" size="lg" loading={isSubmitting} className="flex-1">
                Create Account
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          authService
            .signInWithGoogle()
            .then(() => track(ANALYTICS_EVENTS.SIGNUP_COMPLETED, { method: "google" }))
            .catch((err) => {
              trackError(err, { area: "signup", method: "google" });
              velvetToast.fromError(err, "auth");
            })
        }
      >
        Continue with Google
      </Button>

      <p className="text-center text-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
