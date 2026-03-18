"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { requestUploadUrls, confirmUpload } from "@/actions/images";
import {
  TrackedFile,
  FileStatus,
  ACCEPTED_TYPES,
  MAX_FILE_SIZE,
  MAX_BATCH_SIZE,
  InsertedImage,
} from "./types";

function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image dimensions"));
    };
    img.src = url;
  });
}

function uploadFileToR2(
  file: File,
  uploadUrl: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

interface UseImageUploadProps {
  albumId: string;
  onUploadSuccess?: (image: InsertedImage) => void;
}

export function useImageUpload({ albumId, onUploadSuccess }: UseImageUploadProps) {
  const [files, setFiles] = useState<TrackedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-clear successful uploads after 3 seconds
  useEffect(() => {
    const doneFiles = files.filter((f) => f.status === "done");
    if (doneFiles.length === 0) return;

    const timer = setTimeout(() => {
      setFiles((prev) => prev.filter((f) => f.status !== "done"));
    }, 3000);

    return () => clearTimeout(timer);
  }, [files]);

  const filterValidFiles = useCallback((rawFiles: File[]): File[] => {
    return rawFiles.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_FILE_SIZE) return false;
      return true;
    });
  }, []);

  const processFiles = useCallback(
    async (selectedFiles: File[]) => {
      const valid = filterValidFiles(selectedFiles).slice(0, MAX_BATCH_SIZE);
      if (valid.length === 0) return;

      setIsProcessing(true);

      // Initialize tracked files
      const tracked: TrackedFile[] = valid.map((file, i) => ({
        file,
        id: `file-${Date.now()}-${i}`,
        progress: 0,
        status: "pending" as FileStatus,
      }));
      setFiles((prev) => [...prev, ...tracked]);

      try {
        // Step 1: Request presigned URLs for all files
        const fileInfos = valid.map((f) => ({
          albumId,
          filename: f.name,
          contentType: f.type,
          fileSize: f.size,
        }));

        const uploadData = await requestUploadUrls(fileInfos);

        // Step 2: Upload each file to R2 and confirm
        for (let i = 0; i < valid.length; i++) {
          const file = valid[i];
          const { imageId, uploadUrl } = uploadData[i];
          const trackingId = tracked[i].id;

          // Update status to uploading
          setFiles((prev) =>
            prev.map((f) =>
              f.id === trackingId ? { ...f, status: "uploading" as FileStatus } : f
            )
          );

          try {
            // Upload to R2 via XHR
            await uploadFileToR2(file, uploadUrl, (pct) => {
              setFiles((prev) =>
                prev.map((f) => (f.id === trackingId ? { ...f, progress: pct } : f))
              );
            });

            // Update status to confirming
            setFiles((prev) =>
              prev.map((f) =>
                f.id === trackingId
                  ? { ...f, status: "confirming" as FileStatus, progress: 100 }
                  : f
              )
            );

            // Extract dimensions client-side
            const dimensions = await getImageDimensions(file);

            // Confirm upload with server
            await confirmUpload({
              imageId,
              width: dimensions.width,
              height: dimensions.height,
              fileSize: file.size,
              mimeType: file.type,
            });

            // Done
            setFiles((prev) =>
              prev.map((f) =>
                f.id === trackingId ? { ...f, status: "done" as FileStatus } : f
              )
            );

            // Notify parent for real-time update
            if (onUploadSuccess) {
              onUploadSuccess({
                id: imageId,
                albumId,
                r2Url: uploadData[i].r2Url,
                filename: file.name,
                status: "ready"
              });
            }
          } catch (err) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === trackingId
                  ? {
                      ...f,
                      status: "error" as FileStatus,
                      error: err instanceof Error ? err.message : "Upload failed",
                    }
                  : f
              )
            );
          }
        }
      } catch (err) {
        // If requestUploadUrls itself failed
        setFiles((prev) =>
          prev.map((f) => {
             const isFromThisBatch = tracked.some(t => t.id === f.id);
             if (isFromThisBatch && f.status === "pending") {
                return {
                    ...f,
                    status: "error" as FileStatus,
                    error: err instanceof Error ? err.message : "Failed to request upload URLs",
                  }
             }
             return f;
          })
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [albumId, filterValidFiles, onUploadSuccess]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isProcessing) return;
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [isProcessing, processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isProcessing) return;
      const selected = Array.from(e.target.files || []);
      processFiles(selected);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [isProcessing, processFiles]
  );

  return {
    files,
    setFiles,
    isDragging,
    isProcessing,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  };
}
