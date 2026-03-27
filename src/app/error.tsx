"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

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
      <div className="flex flex-col items-center gap-8 text-center max-w-sm animate-fade-up">
        {/* Glowing icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute size-24 rounded-full bg-destructive/5 blur-xl" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 shadow-[0_0_30px_-5px] shadow-destructive/20">
            <AlertTriangle className="size-9 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight text-balance">
            Something went wrong
          </h1>
          <p className="text-muted-foreground font-sans leading-relaxed">
            We hit an unexpected error. You can try again or head back to the home page.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} className="gap-1.5">
            <RotateCcw className="size-4" data-icon="inline-start" />
            Try Again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" }) + " gap-1.5"}>
            <Home className="size-4" data-icon="inline-start" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
