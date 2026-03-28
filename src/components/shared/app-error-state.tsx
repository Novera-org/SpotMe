"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface AppErrorStateProps {
  title: string;
  description: string;
  reset: () => void;
  backHref?: string;
  backLabel?: string;
  backIcon?: "arrow" | "home";
  className?: string;
}

export function AppErrorState({
  title,
  description,
  reset,
  backHref = "/dashboard",
  backLabel = "Back to Dashboard",
  backIcon = "arrow",
  className,
}: AppErrorStateProps) {
  const BackIcon = backIcon === "home" ? Home : ArrowLeft;

  return (
    <div className={cn("flex items-center justify-center py-24", className)}>
      <div className="flex max-w-md flex-col items-center gap-8 text-center animate-fade-up">
        <div className="relative flex items-center justify-center">
          <div className="absolute size-24 rounded-full bg-destructive/5 blur-xl" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 shadow-[0_0_30px_-5px] shadow-destructive/20">
            <AlertTriangle className="size-9 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground text-balance">
            {title}
          </h1>
          <p className="font-sans leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} className="gap-1.5">
            <RotateCcw className="size-4" data-icon="inline-start" />
            Try Again
          </Button>
          <Link
            href={backHref}
            className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
          >
            <BackIcon className="size-4" data-icon="inline-start" />
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
