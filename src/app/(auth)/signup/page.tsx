import type { Metadata } from "next";
import { AuthLayout, AuthHeader } from "@/components/auth";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up — Velvet",
  description: "Create your Velvet space.",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthHeader
        headline="Create your Velvet space."
        subtext="Start saving inspiration from everywhere."
      />
      <SignupForm />
    </AuthLayout>
  );
}
