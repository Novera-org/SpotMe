"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageItem {
  id: string;
  r2Url: string;
  filename: string;
  status: string;
}

interface ImageLightboxProps {
  image: ImageItem | null;
  onClose: () => void;
  onDelete?: (id: string, filename: string) => void;
}

export function ImageLightbox({
  image,
  onClose,
  onDelete,
}: ImageLightboxProps) {
  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-full h-[80vh] p-0 overflow-hidden bg-background border-border/50 shadow-2xl">
        <div className="relative flex items-center justify-center w-full h-full min-h-[50vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.r2Url.replace('.r2.dev//', '.r2.dev/')}
            alt={image.filename}
            className="max-w-full max-h-[85vh] object-contain select-none"
          />

          {/* Header Overlay */}
          <div className="absolute top-0 inset-x-0 p-4 bg-linear-to-b from-black/80 to-transparent flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-md">
                {image.filename}
              </span>
              {image.status !== "ready" && (
                <Badge
                  variant="secondary"
                  className="w-fit scale-75 origin-left"
                >
                  {image.status}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 pr-14">
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 px-3 rounded-full bg-destructive/80 hover:bg-destructive shadow-lg transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image.id, image.filename);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Image
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MoreImagesModalProps {
  images: ImageItem[];
  isOpen: boolean;
  onClose: () => void;
  onImageClick: (image: ImageItem) => void;
  onDelete: (id: string, filename: string) => void;
  deletingId: string | null;
}

export function MoreImagesModal({
  images,
  isOpen,
  onClose,
  onImageClick,
  onDelete,
  deletingId,
}: MoreImagesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-full h-[80vh] flex flex-col p-0 bg-background border-border overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 border-b border-border bg-muted/5">
          <DialogTitle className="font-serif text-2xl">
            All Album Images
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  "group relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/10 transition-all duration-300 ease-out hover:border-primary/50 cursor-pointer shadow-sm hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]",
                  deletingId === image.id && "opacity-50 pointer-events-none",
                )}
                onClick={() => onImageClick(image)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.r2Url.replace('.r2.dev//', '.r2.dev/')}
                  alt={image.filename}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Hover overlay for delete */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(image.id, image.filename);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Status badge for non-ready images */}
                {image.status !== "ready" && (
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1 capitalize"
                    >
                      {image.status}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
