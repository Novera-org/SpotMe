import { Spinner } from "@/components/ui/spinner";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-fade-up">
        {/* Pulsing glow ring behind spinner */}
        <div className="relative flex items-center justify-center">
          <div className="absolute size-16 rounded-full bg-primary/10 animate-pulse" />
          <Spinner size="lg" />
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
          Loading
        </p>
      </div>
    </div>
  );
}
