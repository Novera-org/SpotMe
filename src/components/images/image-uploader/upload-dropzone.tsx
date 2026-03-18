"use client";

import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_BATCH_SIZE } from "./types";

interface UploadDropzoneProps {
  isDragging: boolean;
  isProcessing: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadDropzone({
  isDragging,
  isProcessing,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  fileInputRef,
  handleFileSelect,
}: UploadDropzoneProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-out",
        "hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:border-primary/50",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-border bg-card/50 hover:bg-muted/10",
        isProcessing && "pointer-events-none opacity-50"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <UploadCloud
        className={cn(
          "transition-colors",
          isDragging ? "text-primary" : "text-muted-foreground/50"
        )}
        size={40}
      />
      <div className="text-center">
        <p className="text-muted-foreground font-medium">
          {isDragging
            ? "Drop images here"
            : "Drag & drop images or click to browse"}
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          JPEG, PNG, WebP • Max 10MB each
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        onChange={handleFileSelect}
      />
    </div>
  );
}
