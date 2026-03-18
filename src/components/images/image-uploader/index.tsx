"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UploadCloud } from "lucide-react";
import { useImageUpload } from "./use-image-upload";
import { UploadDropzone } from "./upload-dropzone";
import { UploadFileList } from "./upload-file-list";
import { MAX_BATCH_SIZE, InsertedImage } from "./types";

interface ImageUploaderProps {
  albumId: string;
  onUploadSuccess?: (image: InsertedImage) => void;
}

export function ImageUploader({ albumId, onUploadSuccess }: ImageUploaderProps) {
  const {
    files,
    setFiles,
    isDragging,
    isProcessing,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  } = useImageUpload({ albumId, onUploadSuccess });

  return (
    <Card
      className="border-border bg-card overflow-hidden"
      style={{
        animation: "fade-up 0.5s ease-out forwards",
        animationDelay: "0.05s",
        opacity: 0,
      }}
    >
      <CardHeader className="bg-muted/10 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-xl font-serif text-balance">
          <UploadCloud className="text-primary" />
          Upload Images
        </CardTitle>
        <CardDescription>
          {`JPEG, PNG, WebP • Max 10MB per file • Up to ${MAX_BATCH_SIZE} files at once`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <UploadDropzone
          isDragging={isDragging}
          isProcessing={isProcessing}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
        />

        <UploadFileList
          files={files}
          isProcessing={isProcessing}
          onClear={() => setFiles([])}
        />
      </CardContent>
    </Card>
  );
}
