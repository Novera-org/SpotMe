import Link from "next/link";
import { getDashboardStats } from "@/actions/stats";
import { AlbumStatusBadge } from "@/components/albums/album-status-badge";
import { AlbumStatusActions } from "@/components/albums/album-status-actions";
import { StatCard, RecentActivityList } from "@/components/albums/album-stats";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ImageIcon,
  Search,
  Download,
  Zap,
  Activity,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="dashboard-page flex flex-col gap-12">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="dashboard-actions">
        <div>
          <h2 className="dashboard-page-title">Dashboard</h2>
          <p className="dashboard-page-desc">
            Overview of your albums and activity.
          </p>
        </div>
        <Link href="/dashboard/albums/new" className={buttonVariants()}>
          Create Album
        </Link>
      </div>

      {/* ── Stat Cards Grid ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Albums" value={stats.totalAlbums} icon="albums" />
        <StatCard label="Images" value={stats.totalImages} icon="images" />
        <StatCard label="Searches" value={stats.totalSearches} icon="searches" />
        <StatCard label="Downloads" value={stats.totalDownloads} icon="downloads" />
      </div>

      {stats.albumStats.length === 0 ? (
        /* ── Empty State ─────────────────────────────────── */
        <div className="empty-state">
          <h3>No Albums Yet</h3>
          <p>Create your first album to start sharing photos.</p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/dashboard/albums/new" className={buttonVariants()}>
              Create Album
            </Link>
          </div>
        </div>
      ) : (
        /* ── Main Content: Albums + Activity ──────────────── */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: album list (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-serif text-balance">Your Albums</h3>
            <div className="space-y-3">
              {stats.albumStats.map((album, index) => (
                <Link
                  key={album.albumId}
                  href={`/dashboard/albums/${album.albumId}`}
                  className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl transition-shadow animate-fade-up"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <Card className="transition-[transform,box-shadow,border-color] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.015] group-hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] group-hover:border-primary/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-semibold line-clamp-1 mr-2 flex-1">
                        {album.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <AlbumStatusBadge status={album.status} />
                        <AlbumStatusActions albumId={album.albumId} currentStatus={album.status} compact />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <MetricItem
                          icon={<ImageIcon className="h-3.5 w-3.5" />}
                          label="Images"
                          value={album.imageCount}
                        />
                        <MetricItem
                          icon={<Search className="h-3.5 w-3.5" />}
                          label="Searches"
                          value={album.searchCount}
                        />
                        <MetricItem
                          icon={<Zap className="h-3.5 w-3.5" />}
                          label="Matches"
                          value={album.matchCount}
                        />
                        <MetricItem
                          icon={<Download className="h-3.5 w-3.5" />}
                          label="Downloads"
                          value={album.downloadCount}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 mt-auto text-xs text-muted-foreground border-t p-4 pb-4">
                      Created on {formatDate(album.createdAt)}
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: recent activity (1/3 width) */}
          <div className="space-y-6">
            <h3 className="text-lg font-serif text-balance">Recent Activity</h3>
            <Card className="border-border bg-card overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-serif text-balance">
                  <Activity className="h-4 w-4 text-primary" />
                  Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 max-h-[320px] overflow-y-auto">
                <RecentActivityList activities={stats.recentActivity} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Metric Item (inline helper) ─────────────────────────────────

function MetricItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
      {icon}
      <span className="font-medium text-foreground tabular-nums">
        {value.toLocaleString()}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
