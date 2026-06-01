import type { Metadata } from "next";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up — Velvet",
  description: "Create your velvet world.",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display mb-2 text-4xl text-on-surface">
          Start planning beautifully.
        </h1>
        <p className="text-on-surface-variant">
          Your emotional planning space begins here.
        </p>
      </div>
      <SignupForm />
    </AuthLayout>
  );
}
