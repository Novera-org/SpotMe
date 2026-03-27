"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

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
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-8 text-center max-w-sm animate-fade-up">
          {/* Glowing icon */}
          <div className="relative flex items-center justify-center">
            <div className="absolute size-24 rounded-full bg-destructive/5 blur-xl" />
            <div className="relative flex size-20 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 shadow-[0_0_30px_-5px] shadow-destructive/20">
              <AlertTriangle className="size-9 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight text-balance">
              Failed to load content
            </h2>
            <p className="text-muted-foreground font-sans leading-relaxed">
              Something went wrong while loading this page. Please try again.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset} className="gap-1.5">
              <RotateCcw className="size-4" data-icon="inline-start" />
              Try Again
            </Button>
            <Link href="/dashboard" className={buttonVariants({ variant: "outline" }) + " gap-1.5"}>
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
