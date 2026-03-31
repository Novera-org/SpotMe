import Link from "next/link";
import { getDashboardStats } from "@/actions/stats";
import { DashboardAlbumCard } from "@/components/albums/dashboard-album-card";
import { StatCard } from "@/components/albums/album-stats";
import { buttonVariants } from "@/components/ui/button-variants";
import { formatDate } from "@/lib/utils";

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
        <div className="space-y-6">
          <h3 className="text-lg font-serif text-balance">Your Albums</h3>
          <div className="album-grid">
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
      )}
    </div>
  );
}
