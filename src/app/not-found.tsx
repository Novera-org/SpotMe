import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-8 text-center max-w-md animate-fade-up">
        {/* Large 404 number with gradient */}
        <div className="relative select-none">
          <span className="text-[10rem] sm:text-[12rem] font-serif font-bold leading-none tracking-tighter bg-linear-to-b from-muted-foreground/25 to-transparent bg-clip-text text-transparent">
            404
          </span>
          {/* Subtle glow beneath the numbers */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-8 w-32 rounded-full bg-primary/10 blur-2xl" />
        </div>

        <div className="space-y-2 -mt-4">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight text-balance">
            Page not found
          </h1>
          <p className="text-muted-foreground font-sans leading-relaxed max-w-xs mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <Link href="/" className={buttonVariants({ variant: "outline" }) + " gap-1.5"}>
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
