"use client";

import { Button } from "@/components/ui/button";
import { UploadFileItem } from "./upload-file-item";
import { TrackedFile } from "./types";

interface UploadFileListProps {
  files: TrackedFile[];
  isProcessing: boolean;
  onClear: () => void;
}

export function UploadFileList({
  files,
  isProcessing,
  onClear,
}: UploadFileListProps) {
  if (files.length === 0) return null;

  const allDone = files.every((f) => f.status === "done" || f.status === "error");

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
        {files.map((tracked) => (
          <UploadFileItem key={tracked.id} tracked={tracked} />
        ))}
      </div>

      {allDone && !isProcessing && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear list
          </Button>
        </div>
      )}
    </div>
  );
}
