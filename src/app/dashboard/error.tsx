"use client";

import { useEffect } from "react";
import { AppErrorState } from "@/components/shared/app-error-state";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="dashboard-page">
      <AppErrorState
        title="We couldn't load this admin page"
        description="This usually means the data request failed or the page state became stale. Try again, or return to your dashboard to continue working."
        reset={reset}
      />
    </div>
  );
}
