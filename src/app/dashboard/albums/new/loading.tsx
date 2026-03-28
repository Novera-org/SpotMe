import { Card, CardContent } from "@/components/ui/card";

function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted/10 ${className}`} />;
}

export default function NewAlbumLoading() {
  return (
    <div className="dashboard-page flex flex-col gap-8">
      <div className="space-y-2">
        <SkeletonLine className="h-9 w-44" />
        <SkeletonLine className="h-4 w-80 max-w-full" />
      </div>

      <Card className="w-full max-w-lg border-border bg-card">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1.5">
            <SkeletonLine className="h-4 w-14" />
            <SkeletonLine className="h-10 w-full" />
          </div>

          <div className="space-y-1.5">
            <SkeletonLine className="h-4 w-24" />
            <SkeletonLine className="h-24 w-full" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SkeletonLine className="h-8 w-32" />
            <SkeletonLine className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
