import Link from "next/link";
import { Activity } from "lucide-react";
import { getDashboardStats } from "@/actions/stats";
import { DashboardAlbumCard } from "@/components/albums/dashboard-album-card";
import { StatCard, RecentActivityList } from "@/components/albums/album-stats";
import { buttonVariants } from "@/components/ui/button-variants";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="dashboard-page flex flex-col gap-12">
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Albums" value={stats.totalAlbums} icon="albums" />
        <StatCard label="Images" value={stats.totalImages} icon="images" />
        <StatCard label="Searches" value={stats.totalSearches} icon="searches" />
        <StatCard
          label="Downloads"
          value={stats.totalDownloads}
          icon="downloads"
        />
      </div>

      {stats.albumStats.length === 0 ? (
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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-serif text-balance">Your Albums</h3>
            <div className="space-y-3">
              {stats.albumStats.map((album, index) => (
                <DashboardAlbumCard
                  key={album.albumId}
                  album={{
                    ...album,
                    createdAtLabel: formatDate(album.createdAt),
                  }}
                  index={index}
                />
              ))}
            </div>
          </div>

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
