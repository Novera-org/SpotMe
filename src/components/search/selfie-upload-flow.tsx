"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  startSearchSession,
  requestSelfieUploadUrl,
  runMatching,
} from "@/actions/matching";
import { Camera, X, Search, AlertCircle, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelfieUploadFlowProps {
  albumId: string;
  albumSlug: string;
  maxSelfies: number;
  requireLogin: boolean;
}

type FlowStep = "upload" | "processing" | "error";

interface SelfieFile {
  file: File;
  previewUrl: string;
}

export function SelfieUploadFlow({
  albumId,
  albumSlug,
  maxSelfies,
  requireLogin,
}: SelfieUploadFlowProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<FlowStep>("upload");
  const [selfies, setSelfies] = useState<SelfieFile[]>([]);
  const [progressText, setProgressText] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newSelfies: SelfieFile[] = [];
    const remaining = maxSelfies - selfies.length;

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      newSelfies.push({
        file: files[i],
        previewUrl: URL.createObjectURL(files[i]),
      });
    }

    setSelfies((prev) => [...prev, ...newSelfies]);

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelfie = (index: number) => {
    setSelfies((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleFindPhotos = async () => {
    if (selfies.length === 0) return;

    setStep("processing");
    setProgressValue(0);

    try {
      // Step 1: Start search session
      setProgressText("Starting search session...");
      setProgressValue(10);
      const sessionResult = await startSearchSession(albumId);

      if ("error" in sessionResult) {
        throw new Error(
          typeof sessionResult.error === "string"
            ? sessionResult.error
            : "Failed to start search session",
        );
      }

      const { sessionId } = sessionResult;

      // Step 2: Upload selfies
      const totalSelfies = selfies.length;
      for (let i = 0; i < totalSelfies; i++) {
        const selfie = selfies[i];
        setProgressText(
          `Uploading selfie ${i + 1} of ${totalSelfies}...`,
        );
        setProgressValue(10 + ((i + 1) / totalSelfies) * 40);

        const urlResult = await requestSelfieUploadUrl({
          searchSessionId: sessionId,
          filename: selfie.file.name,
          contentType: selfie.file.type,
          fileSize: selfie.file.size,
        });

        if ("error" in urlResult) {
          throw new Error(
            typeof urlResult.error === "string"
              ? urlResult.error
              : "Failed to get upload URL",
          );
        }

        // Upload to R2 via presigned URL
        const uploadResponse = await fetch(urlResult.uploadUrl, {
          method: "PUT",
          body: selfie.file,
          headers: { "Content-Type": selfie.file.type },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload selfie ${i + 1}`);
        }
      }

      // Step 3: Run matching
      setProgressText("Finding your photos...");
      setProgressValue(60);

      const matchResult = await runMatching(sessionId);

      if ("error" in matchResult) {
        throw new Error(matchResult.error);
      }

      setProgressText("Done! Redirecting to results...");
      setProgressValue(100);

      // Clean up preview URLs
      selfies.forEach((s) => URL.revokeObjectURL(s.previewUrl));

      // Navigate to results
      router.push(`/album/${albumSlug}/results?session=${sessionId}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
      setStep("error");
    }
  };

  const handleReset = () => {
    selfies.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    setSelfies([]);
    setStep("upload");
    setErrorMessage("");
    setProgressText("");
    setProgressValue(0);
  };

  // ─── Step: Upload ────────────────────────────────────────────────

  if (step === "upload") {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-lg font-serif text-balance">
            Upload a selfie to find your photos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ll match your face to find photos of you in this album
          </p>
        </div>

        {/* File Input Area */}
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-8 cursor-pointer",
            "transition-colors duration-200 hover:border-primary/50 hover:bg-muted/5",
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-8 text-muted-foreground/60" />
          <div className="text-center">
            <p className="font-medium text-foreground">Add Photo(s)</p>
            <p className="text-xs text-muted-foreground mt-1">
              {selfies.length}/{maxSelfies} selfies selected
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={maxSelfies > 1}
            className="sr-only"
            onChange={handleFileSelect}
            disabled={selfies.length >= maxSelfies}
          />
        </div>

        {/* Selfie Previews */}
        {selfies.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {selfies.map((selfie, index) => (
              <div
                key={index}
                className="group relative size-20 overflow-hidden rounded-lg border border-border"
                style={{
                  animation: "fade-up 0.3s ease-out forwards",
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                }}
              >
                <img
                  src={selfie.previewUrl}
                  alt={`Selfie ${index + 1}`}
                  className="size-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelfie(index);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                >
                  <X className="size-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Find Button */}
        <Button
          onClick={handleFindPhotos}
          disabled={selfies.length === 0}
          className="w-full"
          size="lg"
        >
          <Search data-icon="inline-start" />
          Find My Photos
        </Button>
      </div>
    );
  }

  // ─── Step: Processing ────────────────────────────────────────────

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="relative flex items-center justify-center">
          <Loader2 className="size-10 text-primary animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-serif text-balance">
            Looking for your photos...
          </h2>
          <p className="text-sm text-muted-foreground mt-2">{progressText}</p>
        </div>
        <Progress value={progressValue} className="w-full max-w-xs" />
      </div>
    );
  }

  // ─── Step: Error ─────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <AlertCircle className="size-10 text-destructive" />
      <div className="text-center">
        <h2 className="text-lg font-serif text-balance">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground mt-2">{errorMessage}</p>
      </div>
      <Button onClick={handleReset} variant="outline">
        Try Again
      </Button>
    </div>
  );
}
