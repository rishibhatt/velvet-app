"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { ErrorAlert } from "@/components/molecules/ErrorAlert";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container flex min-h-[50vh] flex-col items-center justify-center py-16">
      <ErrorAlert
        error={error}
        title="Something went wrong"
        onRetry={reset}
        className="max-w-lg"
      />
      <Button variant="secondary" className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </main>
  );
}
