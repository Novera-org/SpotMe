"use client";

import { useState } from "react";
import { ImageUploader } from "./image-uploader";
import { ImageGallery } from "./image-gallery";

interface ImageItem {
  id: string;
  r2Url: string;
  filename: string;
  status: string;
}

interface AlbumImageSectionProps {
  albumId: string;
  initialImages: ImageItem[];
}

export function AlbumImageSection({ albumId, initialImages }: AlbumImageSectionProps) {
  const [lastUploadedImage, setLastUploadedImage] = useState<ImageItem | null>(null);

  return (
    <div className="space-y-6">
      <ImageUploader 
        albumId={albumId} 
        onUploadSuccess={(img) => setLastUploadedImage(img)} 
      />
      
      <div className="pt-4">
        <ImageGallery 
          images={initialImages} 
          albumId={albumId} 
          newImage={lastUploadedImage} 
        />
      </div>
    </div>
  );
}
