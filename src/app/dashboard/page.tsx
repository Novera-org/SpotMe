import Link from "next/link";
import { getAdminAlbums } from "@/actions/albums";
import { AlbumStatusBadge } from "@/components/albums/album-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default async function DashboardPage() {
  const albumsList = await getAdminAlbums();

  return (
    <div className="dashboard-page">
      <div className="dashboard-actions">
        <div>
          <h2 className="dashboard-page-title">Albums</h2>
          <p className="dashboard-page-desc">
            Manage your photo albums and sharing.
          </p>
        </div>
        <Link href="/dashboard/albums/new" className={buttonVariants()}>
          Create Album
        </Link>
      </div>

      {albumsList.length === 0 ? (
        <div className="empty-state">
          <h3>No albums yet</h3>
          <p>Create your first album to start sharing photos.</p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/dashboard/albums/new" className={buttonVariants()}>
              Create Album
            </Link>
          </div>
        </div>
      ) : (
        <div className="album-grid">
          {albumsList.map((album, index) => (
            <Link
              key={album.id}
              href={`/dashboard/albums/${album.id}`}
              className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl transition-all"
              style={{
                animation: "fade-up 0.5s ease-out forwards",
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
              }}
            >
              <Card className="h-full flex flex-col transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.015] group-hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] group-hover:border-primary/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-1 mr-2 flex-1">
                    {album.title}
                  </CardTitle>
                  <AlbumStatusBadge status={album.status} />
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  {album.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {album.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-0 mt-auto text-xs text-muted-foreground border-t p-4 pb-4">
                  Created on {new Date(album.createdAt).toLocaleDateString()}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
