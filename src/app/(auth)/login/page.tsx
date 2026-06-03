import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout, AuthHeader } from "@/components/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { AuthCodeHandler } from "@/features/auth/components/AuthCodeHandler";

export const metadata: Metadata = {
  title: "Sign In — Velvet",
  description: "Welcome back to your inspiration space.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <AuthCodeHandler />
      </Suspense>
      <AuthHeader
        headline="Welcome back."
        subtext="Your inspiration space is waiting."
      />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
