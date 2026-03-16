import { getAlbumById } from "@/actions/albums";
import { getAlbumShareLinks } from "@/actions/share-links";
import { AlbumStatusBadge } from "@/components/albums/album-status-badge";
import { ShareLinkManager } from "@/components/albums/share-link-manager";
import { APP_URL, ALBUM_STATUS } from "@/config/constants";

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { id } = await params;
  const album = await getAlbumById(id);
  const links = await getAlbumShareLinks(id);

  const publicUrl = `${APP_URL}/album/${album.slug}`;

  return (
    <div className="dashboard-page">
      {/* Album Header */}
      <div className="album-detail-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h2 className="dashboard-page-title">{album.title}</h2>
            <AlbumStatusBadge status={album.status} />
          </div>
          {album.description && (
            <p className="dashboard-page-desc">{album.description}</p>
          )}
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--muted)",
              marginTop: "0.5rem",
            }}
          >
            Created on {new Date(album.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Public URL & Share Links (Gated) */}
      {album.status === ALBUM_STATUS.ACTIVE ? (
        <>
          <section className="album-section">
            <h3>Public Album URL</h3>
            <code className="album-url-block">{publicUrl}</code>
          </section>

          <section className="album-section">
            <ShareLinkManager albumId={album.id} slug={album.slug} shareLinks={links} />
          </section>
        </>
      ) : (
        <section className="album-section">
          <h3>Sharing</h3>
          <div className="status-notice">
            <p>
              Sharing is unavailable because this album is currently in{" "}
              <strong>{album.status}</strong> status. Activation is required
              to generate public URLs or share links.
            </p>
          </div>
        </section>
      )}

      {/* Images Placeholder */}
      <section className="album-section">
        <h3>Images</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          Image upload will be available in the next update.
        </p>
      </section>

      {/* Settings Display */}
      {album.settings && (
        <section className="album-section">
          <h3>Settings</h3>
          <div className="settings-grid">
            <div className="settings-item">
              <span className="settings-label">Allow Downloads</span>
              <span>{album.settings.allowDownloads ? "Yes" : "No"}</span>
            </div>
            <div className="settings-item">
              <span className="settings-label">Watermark</span>
              <span>{album.settings.watermark ? "Yes" : "No"}</span>
            </div>
            <div className="settings-item">
              <span className="settings-label">Require Login</span>
              <span>{album.settings.requireLogin ? "Yes" : "No"}</span>
            </div>
            <div className="settings-item">
              <span className="settings-label">Max Selfies</span>
              <span>{album.settings.maxSelfies}</span>
            </div>
            <div className="settings-item">
              <span className="settings-label">Match Threshold</span>
              <span>{album.settings.matchThreshold}</span>
            </div>
            <div className="settings-item">
              <span className="settings-label">Link Expires</span>
              <span>
                {album.settings.linkExpiresAt
                  ? new Date(album.settings.linkExpiresAt).toLocaleDateString()
                  : "Never"}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
