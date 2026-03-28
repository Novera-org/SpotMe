"use client";

import { useEffect } from "react";
import { AppErrorState } from "@/components/shared/app-error-state";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <AppErrorState
        title="Something went wrong"
        description="An unexpected error interrupted the app. Try loading the page again, or head back to your dashboard."
        reset={reset}
        backHref="/dashboard"
        backLabel="Go to Dashboard"
        backIcon="home"
        className="py-0"
      />
    </div>
  );
}
