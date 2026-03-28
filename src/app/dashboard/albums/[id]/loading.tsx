import { ArrowLeft, Image as ImageIcon, Info, Settings2, Share2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted/10 ${className}`} />;
}

export default function AlbumDetailLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-8 sm:px-6">
      <div>
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          <SkeletonLine className="h-4 w-32" />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <SkeletonLine className="h-10 w-56" />
            <div className="flex flex-wrap items-center gap-3">
              <SkeletonLine className="h-7 w-20 rounded-full" />
              <SkeletonLine className="h-7 w-20 rounded-full" />
              <SkeletonLine className="h-8 w-28" />
            </div>
          </div>

          <SkeletonLine className="h-5 w-[28rem] max-w-full" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            <SkeletonLine className="h-3 w-36" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Card className="border-border">
          <CardHeader className="border-b border-border bg-muted/10">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <SkeletonLine className="h-6 w-40" />
            </div>
            <SkeletonLine className="mt-2 h-4 w-64 max-w-full" />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <SkeletonLine className="h-4 w-28" />
              <SkeletonLine className="h-12 w-full rounded-lg" />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SkeletonLine className="h-5 w-36" />
                <SkeletonLine className="h-9 w-32" />
              </div>

              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 border border-border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-2">
                      <SkeletonLine className="h-4 w-40" />
                      <SkeletonLine className="h-3 w-56 max-w-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <SkeletonLine className="h-8 w-20" />
                      <SkeletonLine className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-primary" />
              <SkeletonLine className="h-7 w-40" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border-2 border-dashed border-border p-10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div className="absolute size-14 rounded-full bg-primary/5 animate-pulse" />
                  <Spinner size="lg" />
                </div>
                <div className="space-y-2 text-center">
                  <SkeletonLine className="h-4 w-40" />
                  <SkeletonLine className="h-3 w-56 max-w-full" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-lg border border-border bg-card animate-fade-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <SkeletonLine className="size-full rounded-none" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="border-b border-border bg-muted/10">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <SkeletonLine className="h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <SkeletonLine className="h-3 w-24" />
                  <SkeletonLine className="h-5 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
