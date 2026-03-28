"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { deleteImage } from "@/actions/images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageLightbox, MoreImagesModal } from "./image-modals";

interface ImageItem {
  id: string;
  r2Url: string;
  filename: string;
  status: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  albumId: string;
  totalCount: number;
  allImages?: ImageItem[];
  newImage?: ImageItem | null;
}

const GRID_LIMIT = 15;

export function ImageGallery({
  images: initialImages,
  albumId,
  totalCount,
  allImages,
  newImage,
}: ImageGalleryProps) {
  const [imageList, setImageList] = useState(initialImages);
  const [modalImageList, setModalImageList] = useState(allImages ?? initialImages);
  const [totalImageCount, setTotalImageCount] = useState(totalCount);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync when initialImages prop changes (e.g., server refresh)
  useEffect(() => {
    setImageList(initialImages);
  }, [initialImages]);

  useEffect(() => {
    setModalImageList(allImages ?? initialImages);
  }, [allImages, initialImages]);

  useEffect(() => {
    setTotalImageCount(totalCount);
  }, [totalCount]);

  // Sync real-time updates from uploader
  useEffect(() => {
    if (newImage) {
      setImageList((prev) => {
        if (prev.find((p) => p.id === newImage.id)) return prev;

        setModalImageList((mPrev) =>
          mPrev.find((m) => m.id === newImage.id)
            ? mPrev
            : [newImage, ...mPrev],
        );
        setTotalImageCount((c) => c + 1);

        return [newImage, ...prev];
      });
    }
  }, [newImage]);

  const handleDelete = useCallback(
    async (imageId: string, filename: string) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${filename}"? This action cannot be undone.`,
      );
      if (!confirmed) return;

      setDeletingId(imageId);
      try {
        await deleteImage(imageId);
        setImageList((prev) => prev.filter((img) => img.id !== imageId));
        setModalImageList((prev) => prev.filter((img) => img.id !== imageId));
        setTotalImageCount((count) => Math.max(0, count - 1));
        if (selectedImage?.id === imageId) setSelectedImage(null);
      } catch (error) {
        console.error("Failed to delete image:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to delete image",
        );
      } finally {
        setDeletingId(null);
      }
    },
    [selectedImage],
  );

  const handleOpenMoreModal = useCallback(() => {
    setIsMoreModalOpen(true);
  }, []);

  if (modalImageList.length === 0) {

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-lg bg-card/50">
        <p className="text-muted-foreground font-medium">
          No images uploaded yet
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Use the uploader above to add images to this album.
        </p>
      </div>
    );
  }

  const visibleImages = modalImageList.slice(0, GRID_LIMIT);
  const displayedCount = visibleImages.length;
  const remainingCount = Math.max(0, totalImageCount - displayedCount);
  const hasMore = remainingCount > 0;

  return (
    <>
      <div className="space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {visibleImages.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:border-primary/50 cursor-pointer",
                deletingId === image.id && "opacity-50 pointer-events-none",
              )}
              role="button"
              tabIndex={0}
              aria-label={`Open image ${image.filename}`}
              style={{
                animation: "fade-up 0.5s ease-out forwards",
                animationDelay: `${0.02 * index}s`,
                opacity: 0,
              }}
              onClick={() => setSelectedImage(image)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedImage(image);
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.r2Url.replace(".r2.dev//", ".r2.dev/")}
                alt={image.filename}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Status badge for non-ready images */}
              {image.status !== "ready" && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {image.status}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleOpenMoreModal}
              className="min-w-[200px] font-sans tracking-wide"
            >
              {`Show More Images (${remainingCount} more)`}
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox for single image preview */}
      <ImageLightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onDelete={handleDelete}
      />

      {/* "More Images" Modal */}
      <MoreImagesModal
        images={modalImageList}
        isOpen={isMoreModalOpen}
        onClose={() => setIsMoreModalOpen(false)}
        onImageClick={(img) => {
          setSelectedImage(img);
        }}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </>
  );
}
