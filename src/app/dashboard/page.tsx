import Link from "next/link";
import { getAdminAlbums } from "@/actions/albums";
import { AlbumStatusBadge } from "@/components/albums/album-status-badge";

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
        <Link href="/dashboard/albums/new" className="form-button">
          Create Album
        </Link>
      </div>

      {albumsList.length === 0 ? (
        <div className="empty-state">
          <h3>No albums yet</h3>
          <p>Create your first album to start sharing photos.</p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/dashboard/albums/new" className="form-button">
              Create Album
            </Link>
          </div>
        </div>
      ) : (
        <div className="album-grid">
          {albumsList.map((album) => (
            <Link
              key={album.id}
              href={`/dashboard/albums/${album.id}`}
              className="album-card"
            >
              <div className="album-card-header">
                <h3 className="album-card-title">{album.title}</h3>
                <AlbumStatusBadge status={album.status} />
              </div>
              {album.description && (
                <p className="album-card-description">{album.description}</p>
              )}
              <div className="album-card-footer">
                Created on {new Date(album.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
