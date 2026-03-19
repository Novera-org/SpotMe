"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/search/favorite-button";
import { Download, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MatchItem {
  matchResult: {
    id: string;
    similarityScore: number;
    createdAt: Date;
  };
  image: {
    id: string;
    r2Url: string;
    filename: string;
  };
}

interface MatchResultsGridProps {
  matches: MatchItem[];
  albumId: string;
  savedImageIds: string[];
}

async function downloadImage(url: string, filename: string) {
  // Use a server-side proxy to avoid CORS issues when fetching from R2
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

export function MatchResultsGrid({
  matches,
  albumId,
  savedImageIds,
}: MatchResultsGridProps) {
  const [lightboxImage, setLightboxImage] = useState<MatchItem | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      for (const match of matches) {
        await downloadImage(match.image.r2Url, match.image.filename);
        // Small delay between downloads to avoid browser blocking
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (error) {
      console.error("Batch download failed:", error);
      toast.error("An error occurred during the batch download.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Download All Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleDownloadAll}
          variant="outline"
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

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {matches.map((match, index) => (
          <div
            key={match.matchResult.id}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/5 cursor-pointer",
              "transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:border-primary/50",
            )}
            style={{
              animation: "fade-up 0.5s ease-out forwards",
              animationDelay: `${index * 0.05}s`,
              opacity: 0,
            }}
            onClick={() => setLightboxImage(match)}
            tabIndex={0}
            role="button"
            aria-label={`View photo ${match.image.filename}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLightboxImage(match);
              }
            }}
          >
            <img
              src={match.image.r2Url}
              alt={match.image.filename}
              className="size-full object-cover"
            />

            {/* Favorite Button — always visible top-right */}
            <div
              className="absolute top-2 right-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <FavoriteButton
                albumId={albumId}
                imageId={match.image.id}
                isSaved={savedImageIds.includes(match.image.id)}
                size="sm"
              />
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end bg-linear-to-t from-black/70 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Badge variant="secondary" className="mb-2">
                {Math.round(match.matchResult.similarityScore * 100)}% match
              </Badge>
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await downloadImage(match.image.r2Url, match.image.filename);
                  } catch (error) {
                    console.error("Download failed:", error);
                    toast.error(`Failed to download ${match.image.filename}`);
                  }
                }}
              >
                <Download data-icon="inline-start" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-2rem)] border-none bg-black/95 p-0 sm:max-w-2xl lg:max-w-3xl"
        >
          <DialogTitle className="sr-only">
            {lightboxImage?.image.filename ?? "Image preview"}
          </DialogTitle>

          <DialogClose className="absolute right-4 top-4 z-50 rounded-full border border-white/10 bg-black/60 p-2 text-white shadow-xl backdrop-blur-md transition-all hover:bg-black/80 active:scale-95">
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {/* Favorite in lightbox */}
          {lightboxImage && (
            <div className="absolute left-4 top-4 z-50">
              <FavoriteButton
                albumId={albumId}
                imageId={lightboxImage.image.id}
                isSaved={savedImageIds.includes(lightboxImage.image.id)}
              />
            </div>
          )}
          
          {lightboxImage && (
            <div className="flex items-center justify-center p-1">
              <img
                src={lightboxImage.image.r2Url}
                alt={lightboxImage.image.filename}
                className="max-h-[85vh] w-full rounded object-contain"
              />
            </div>
          )}

          {/* Download button in lightbox */}
          {lightboxImage && (
            <div className="absolute bottom-4 right-4 z-50">
              <button
                onClick={async () => {
                  try {
                    await downloadImage(
                      lightboxImage.image.r2Url,
                      lightboxImage.image.filename,
                    );
                  } catch (error) {
                    console.error("Download failed:", error);
                    toast.error(
                      `Failed to download ${lightboxImage.image.filename}`,
                    );
                  }
                }}
                className="rounded-full border border-white/10 bg-black/60 p-2 text-white shadow-xl backdrop-blur-md transition-all hover:bg-black/80 active:scale-95"
                aria-label={`Download ${lightboxImage.image.filename}`}
              >
                <Download className="size-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
