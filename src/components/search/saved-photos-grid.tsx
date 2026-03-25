"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { FavoriteButton } from "@/components/search/favorite-button";
import { Spinner } from "@/components/ui/spinner";
import { Download, X, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SavedPhoto {
  savedPhotoId: string;
  imageId: string;
  savedAt: Date;
  r2Url: string;
  filename: string;
}

interface SavedPhotosGridProps {
  photos: SavedPhoto[];
  albumId: string;
}

async function downloadImage(url: string, filename: string) {
  const response = await fetch(
    `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`,
  );
  if (!response.ok) throw new Error("Download failed");

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

export function SavedPhotosGrid({ photos, albumId }: SavedPhotosGridProps) {
  const [lightboxPhoto, setLightboxPhoto] = useState<SavedPhoto | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const handleSingleDownload = useCallback(async (id: string, url: string, filename: string) => {
    if (downloadingIds.has(id)) return;
    setDownloadingIds((prev) => new Set(prev).add(id));
    try {
      await downloadImage(url, filename);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Failed to download ${filename}`);
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [downloadingIds]);

  if (photos.length === 0) return null;

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      for (const photo of photos) {
        await downloadImage(photo.r2Url, photo.filename);
        await new Promise((r) => setTimeout(r, 300));
      }
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="size-5 text-red-400 fill-red-400" />
          <h3 className="text-lg font-serif">Saved Photos</h3>
          <Badge variant="secondary">{photos.length}</Badge>
        </div>
        <Button
          onClick={handleDownloadAll}
          variant="outline"
          size="sm"
          disabled={isDownloadingAll}
        >
          {isDownloadingAll ? (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          ) : (
            <Download data-icon="inline-start" />
          )}
          {isDownloadingAll ? "Downloading..." : "Download All"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <div
            key={photo.savedPhotoId}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/5 cursor-pointer",
              "transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:border-primary/50",
            )}
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: `${index * 0.05}s`,
              opacity: 0,
            }}
            onClick={() => setLightboxPhoto(photo)}
            tabIndex={0}
            role="button"
            aria-label={`View photo ${photo.filename}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLightboxPhoto(photo);
              }
            }}
          >
            <img
              src={photo.r2Url}
              alt={photo.filename}
              className="size-full object-cover"
            />

            {/* Favorite Button */}
            <div
              className="absolute top-2 right-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <FavoriteButton
                albumId={albumId}
                imageId={photo.imageId}
                isSaved={true}
                size="sm"
              />
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end bg-linear-to-t from-black/70 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                disabled={downloadingIds.has(photo.savedPhotoId)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSingleDownload(photo.savedPhotoId, photo.r2Url, photo.filename);
                }}
              >
                {downloadingIds.has(photo.savedPhotoId) ? (
                  <Spinner size="sm" className="border-current/25 border-t-current" />
                ) : (
                  <Download data-icon="inline-start" />
                )}
                {downloadingIds.has(photo.savedPhotoId) ? "Downloading…" : "Download"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog
        open={!!lightboxPhoto}
        onOpenChange={(open) => !open && setLightboxPhoto(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-2rem)] border-none bg-black/95 p-0 sm:max-w-2xl lg:max-w-3xl"
        >
          <DialogTitle className="sr-only">
            {lightboxPhoto?.filename ?? "Image preview"}
          </DialogTitle>

          <DialogClose className="absolute right-4 top-4 z-50 rounded-full border border-white/10 bg-black/60 p-2 text-white shadow-xl backdrop-blur-md transition-all hover:bg-black/80 active:scale-95">
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {lightboxPhoto && (
            <div className="absolute left-4 top-4 z-50">
              <FavoriteButton
                albumId={albumId}
                imageId={lightboxPhoto.imageId}
                isSaved={true}
              />
            </div>
          )}

          {lightboxPhoto && (
            <div className="flex items-center justify-center p-1">
              <img
                src={lightboxPhoto.r2Url}
                alt={lightboxPhoto.filename}
                className="max-h-[85vh] w-full rounded object-contain"
              />
            </div>
          )}

          {/* Download button in lightbox */}
          {lightboxPhoto && (
            <div className="absolute bottom-4 right-4 z-50">
              <button
                disabled={downloadingIds.has(lightboxPhoto.savedPhotoId)}
                onClick={() => handleSingleDownload(lightboxPhoto.savedPhotoId, lightboxPhoto.r2Url, lightboxPhoto.filename)}
                className="rounded-full border border-white/10 bg-black/60 p-2 text-white shadow-xl backdrop-blur-md transition-all hover:bg-black/80 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                aria-label={`Download ${lightboxPhoto.filename}`}
              >
                {downloadingIds.has(lightboxPhoto.savedPhotoId) ? (
                  <Spinner size="sm" className="border-white/25 border-t-white" />
                ) : (
                  <Download className="size-5" />
                )}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
