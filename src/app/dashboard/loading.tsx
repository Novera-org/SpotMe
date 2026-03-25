import { Spinner } from "@/components/ui/spinner";

export default function DashboardLoading() {
  return (
    <div className="dashboard-page">
      {/* Skeleton header row */}
      <div className="dashboard-actions">
        <div className="space-y-2">
          <div className="h-7 w-28 rounded-lg bg-muted/20 animate-pulse" />
          <div className="h-4 w-52 rounded-md bg-muted/10 animate-pulse" />
        </div>
        <div className="h-8 w-28 rounded-lg bg-muted/15 animate-pulse" />
      </div>

      {/* Skeleton card grid */}
      <div className="album-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card overflow-hidden"
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: `${i * 0.08}s`,
              opacity: 0,
            }}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-36 rounded-md bg-muted/20 animate-pulse" />
                <div className="h-5 w-14 rounded-full bg-muted/15 animate-pulse" />
              </div>
              <div className="h-4 w-full rounded-md bg-muted/10 animate-pulse" />
              <div className="h-4 w-3/4 rounded-md bg-muted/10 animate-pulse" />
            </div>
            <div className="border-t border-border p-4">
              <div className="h-3 w-32 rounded-md bg-muted/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Centered loader */}
      <div className="flex items-center justify-center py-8 gap-3">
        <Spinner size="md" />
        <span className="text-sm text-muted-foreground/60 font-sans">Loading your albums…</span>
      </div>
    </div>
  );
}
