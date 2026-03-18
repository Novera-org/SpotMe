import { getAlbumById } from "@/actions/albums";
import { getAlbumShareLinks } from "@/actions/share-links";
import { getAlbumImages } from "@/actions/images";
import { AlbumStatusBadge } from "@/components/albums/album-status-badge";
import { ShareLinkManager } from "@/components/albums/share-link-manager/index";
import { AlbumImageSection } from "@/components/images/album-image-section";
import { APP_URL, ALBUM_STATUS } from "@/config/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Settings2, Share2, Info } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({
  params,
}: AlbumDetailPageProps) {
  const { id } = await params;

  let album;
  try {
    album = await getAlbumById(id);
  } catch (err) {
    if (err instanceof Error && /not found|access denied/i.test(err.message)) {
      notFound();
    }
    throw err;
  }

  const links =
    album.status === ALBUM_STATUS.ACTIVE ? await getAlbumShareLinks(id) : [];

  // Fetch initial batch (first 24)
  const albumImages = await getAlbumImages(id, 24, 0);

  const publicUrl = `${APP_URL}/album/${album.slug}`;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Back Button */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Album Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground text-balance">
              {album.title}
            </h1>
            <AlbumStatusBadge status={album.status} />
          </div>
          {album.description && (
            <p className="text-muted-foreground text-lg mb-3 max-w-2xl">
              {album.description}
            </p>
          )}
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Created on {new Date(album.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Public URL & Share Links (Gated) */}
        {album.status === ALBUM_STATUS.ACTIVE ? (
          <Card className="border-border">
            <CardHeader className="bg-muted/10 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-xl font-serif">
                <Share2 className="h-5 w-5 text-primary" />
                Sharing & Access
              </CardTitle>
              <CardDescription>
                Manage public links and access for this album.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Public Album URL</h3>
                <code className="block p-3 bg-muted/20 border border-border rounded-lg text-sm select-all text-primary font-mono break-all">
                  {publicUrl}
                </code>
              </div>
              <ShareLinkManager
                albumId={album.id}
                slug={album.slug}
                shareLinks={links}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-serif">
                <Share2 className="h-5 w-5" />
                Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-500 font-medium">
                Sharing is unavailable because this album is currently in{" "}
                <span className="font-bold underline decoration-yellow-500/30 underline-offset-4">{album.status}</span> status. Activation is required to
                generate public URLs or share links.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Images Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-primary" />
              Album Images
              <span className="text-sm font-sans font-normal text-muted-foreground ml-2">
                ({albumImages.length} images)
              </span>
            </h2>
          </div>

          <AlbumImageSection 
            albumId={album.id} 
            initialImages={albumImages} 
          />
        </div>

        {/* Settings Display */}
        {album.settings && (
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-xl font-serif">
                <Settings2 className="h-5 w-5 text-primary" />
                Configuration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Allow Downloads</span>
                  <div className="font-medium text-foreground">{album.settings.allowDownloads ? "Yes" : "No"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Watermark</span>
                  <div className="font-medium text-foreground">{album.settings.watermark ? "Yes" : "No"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Require Login</span>
                  <div className="font-medium text-foreground">{album.settings.requireLogin ? "Yes" : "No"}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Max Selfies</span>
                  <div className="font-medium text-foreground">{album.settings.maxSelfies}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Match Threshold</span>
                  <div className="font-medium text-foreground">{album.settings.matchThreshold}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Link Expires</span>
                  <div className="font-medium text-foreground">
                    {album.settings.linkExpiresAt
                      ? new Date(album.settings.linkExpiresAt).toLocaleDateString()
                      : "Never"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
