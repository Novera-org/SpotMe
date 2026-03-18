"use client";

import { FileImage, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackedFile, FileStatus } from "./types";
import { Progress, ProgressValue } from "@/components/ui/progress";

interface UploadFileItemProps {
  tracked: TrackedFile;
}

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

export function UploadFileItem({ tracked }: UploadFileItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/10 border border-border rounded-lg">
      <div className="shrink-0">{statusIcon(tracked.status)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {tracked.file.name}
        </p>
        <div className="flex flex-col gap-1.5 mt-1">
          <Progress value={tracked.progress}>
            <ProgressValue>{() => statusLabel(tracked.status)}</ProgressValue>
          </Progress>
        </div>
        {tracked.error && (
          <p className="text-xs text-destructive mt-1">
            {tracked.error}
          </p>
        )}
      </div>
    </div>
  );
}
