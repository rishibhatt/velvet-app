import type { Metadata } from "next";
import { Suspense } from "react";
import { EmailSentClient } from "./EmailSentClient";

export const metadata: Metadata = {
  title: "Check Your Email — Velvet",
  description: "We sent you a secure link.",
};

export default function EmailSentPage() {
  return (
    <Suspense fallback={null}>
      <EmailSentClient />
    </Suspense>
  );
}
