import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { AuthCodeHandler } from "@/features/auth/components/AuthCodeHandler";

export const metadata: Metadata = {
  title: "Sign In — Velvet",
  description: "Welcome back to your velvet world.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <AuthCodeHandler />
      </Suspense>
      <div className="mb-8">
        <h1 className="font-display mb-2 text-4xl text-on-surface">Welcome back.</h1>
        <p className="text-on-surface-variant">Your velvet world awaits.</p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
}
