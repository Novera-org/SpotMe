import { notFound } from "next/navigation";
import { getPublicAlbum, trackShareLinkAccess } from "@/actions/public-albums";
import { getFavorites } from "@/actions/favorites";
import { SelfieUploadFlow } from "@/components/search/selfie-upload-flow";
import { SavedPhotosGrid } from "@/components/search/saved-photos-grid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Camera, ImageIcon } from "lucide-react";

interface AlbumPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function PublicAlbumPage({
  params,
  searchParams,
}: AlbumPageProps) {
  const { slug } = await params;
  const { ref } = await searchParams;

  const album = await getPublicAlbum(slug);
  if (!album) notFound();

  // Track share link access if ref code is present
  if (ref) {
    await trackShareLinkAccess(ref);
  }

  const maxSelfies = album.settings?.maxSelfies ?? 3;
  const requireLogin = album.settings?.requireLogin ?? false;

  // Fetch saved photos for this album (safe — returns [] for new guests)
  let savedPhotos: Awaited<ReturnType<typeof getFavorites>> = [];
  try {
    savedPhotos = await getFavorites(album.id);
  } catch {
    // Guest may not have a session yet — that's fine
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        {/* Album Header */}
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-serif text-balance">
              <Camera className="text-primary" />
              {album.title}
            </CardTitle>
            {album.description && (
              <CardDescription className="text-muted-foreground mt-2 text-balance">
                {album.description}
              </CardDescription>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {album.imageCount} {album.imageCount === 1 ? "photo" : "photos"}{" "}
              in this album
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            {album.imageCount > 0 ? (
              <SelfieUploadFlow
                albumId={album.id}
                albumSlug={slug}
                maxSelfies={maxSelfies}
                requireLogin={requireLogin}
              />
            ) : (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <ImageIcon className="size-12 text-muted-foreground/50" />
                <p className="text-muted-foreground font-sans">
                  This album doesn&apos;t have any photos yet.
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Check back later!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Photos Section */}
        {savedPhotos.length > 0 && (
          <Card className="border-border bg-card overflow-hidden">
            <CardContent className="pt-6">
              <SavedPhotosGrid photos={savedPhotos} albumId={album.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
