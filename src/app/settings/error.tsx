"use client";

import { useEffect } from "react";
import { AppErrorState } from "@/components/shared/app-error-state";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SettingsError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Settings error:", error);
  }, [error]);

  return (
    <AppErrorState
      title="We couldn't load your settings"
      description="Your account or album preferences are temporarily unavailable. Try again, or return to the dashboard and come back in a moment."
      reset={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  );
}
