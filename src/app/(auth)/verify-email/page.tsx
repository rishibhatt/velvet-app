import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify Email — Velvet",
  description: "Confirm your email to continue.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailClient />
    </Suspense>
  );
}
