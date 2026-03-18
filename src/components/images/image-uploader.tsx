"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { requestUploadUrls, confirmUpload } from "@/actions/images";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileImage, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_BATCH_SIZE = 50;

type FileStatus = "pending" | "uploading" | "confirming" | "done" | "error";

interface TrackedFile {
  file: File;
  id: string;
  progress: number;
  status: FileStatus;
  error?: string;
}

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

interface ImageUploaderProps {
  albumId: string;
  onUploadSuccess?: (image: any) => void;
}

export function ImageUploader({ albumId, onUploadSuccess }: ImageUploaderProps) {
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
      setFiles(tracked);

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

          // Update status to uploading
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "uploading" as FileStatus } : f
            )
          );

          try {
            // Upload to R2 via XHR
            await uploadFileToR2(file, uploadUrl, (pct) => {
              setFiles((prev) =>
                prev.map((f, idx) => (idx === i ? { ...f, progress: pct } : f))
              );
            });

            // Update status to confirming
            setFiles((prev) =>
              prev.map((f, idx) =>
                idx === i
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
              prev.map((f, idx) =>
                idx === i ? { ...f, status: "done" as FileStatus } : f
              )
            );

            // Notify parent for real-time update
            if (onUploadSuccess) {
              // We need the full image object. For now, we can approximate it or 
              // the server action could return the full record.
              // Our confirmUpload doesn't return the record currently. 
              // Let's assume we just want to trigger a refresh or pass basic info.
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
              prev.map((f, idx) =>
                idx === i
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
          prev.map((f) => ({
            ...f,
            status: "error" as FileStatus,
            error:
              err instanceof Error ? err.message : "Failed to request upload URLs",
          }))
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [albumId, filterValidFiles]
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

  const statusIcon = (status: FileStatus) => {
    switch (status) {
      case "pending":
        return <FileImage className="text-muted-foreground" />;
      case "uploading":
        return <Loader2 className="text-primary animate-spin" />;
      case "confirming":
        return <Loader2 className="text-primary animate-spin" />;
      case "done":
        return <CheckCircle2 className="text-emerald-400" />;
      case "error":
        return <XCircle className="text-destructive" />;
    }
  };

  const statusLabel = (status: FileStatus) => {
    switch (status) {
      case "pending":
        return "Waiting…";
      case "uploading":
        return "Uploading";
      case "confirming":
        return "Processing";
      case "done":
        return "Complete";
      case "error":
        return "Failed";
    }
  };

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
          JPEG, PNG, WebP • Max 10MB per file • Up to 50 files at once
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Drop Zone */}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border bg-card/50 hover:border-primary/50 hover:bg-muted/10",
            isProcessing && "pointer-events-none opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
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

        {/* Progress List */}
        {files.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            {files.map((tracked) => (
              <div
                key={tracked.id}
                className="flex items-center gap-3 p-3 bg-muted/10 border border-border rounded-lg"
              >
                <div className="shrink-0">{statusIcon(tracked.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tracked.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Progress bar */}
                    <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          tracked.status === "error"
                            ? "bg-destructive"
                            : tracked.status === "done"
                              ? "bg-emerald-400"
                              : "bg-primary"
                        )}
                        style={{ width: `${tracked.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                      {statusLabel(tracked.status)}
                    </span>
                  </div>
                  {tracked.error && (
                    <p className="text-xs text-destructive mt-1">
                      {tracked.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clear button after all done */}
        {files.length > 0 &&
          !isProcessing &&
          files.every((f) => f.status === "done" || f.status === "error") && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiles([])}
              >
                Clear list
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
