import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

export default function AlbumLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <Card
          className="border-border bg-card overflow-hidden"
          style={{
            animation: "fade-up 0.5s ease-out forwards",
            opacity: 0,
          }}
        >
          {/* Skeleton header matching album header structure */}
          <div className="bg-muted/10 border-b border-border p-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-primary/20 animate-pulse" />
              <div className="h-6 w-44 rounded-lg bg-muted/20 animate-pulse" />
            </div>
            <div className="h-4 w-64 rounded-md bg-muted/10 animate-pulse" />
            <div className="h-3 w-32 rounded-md bg-muted/10 animate-pulse" />
          </div>

          <CardContent className="pt-6">
            {/* Skeleton upload area */}
            <div className="rounded-xl border-2 border-dashed border-border p-12 flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute size-14 rounded-full bg-primary/5 animate-pulse" />
                <Spinner size="lg" />
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <div className="h-4 w-40 rounded-md bg-muted/15 animate-pulse" />
                <div className="h-3 w-56 rounded-md bg-muted/10 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
