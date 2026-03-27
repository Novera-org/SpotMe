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
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";

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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<FlowStep>("upload");
  const [selfies, setSelfies] = useState<SelfieFile[]>([]);
  const [progressText, setProgressText] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const { data: session } = useSession();

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const isValidImageFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return `"${file.name}" is not a supported format. Use JPEG, PNG, or WebP.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`;
    }
    if (file.size === 0) {
      return `"${file.name}" appears to be empty.`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (requireLogin && !session) {
      toast.warning(
        "This album is private. Please sign in first so we can verify access before you upload.",
      );
      router.push(
        `/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newSelfies: SelfieFile[] = [];
    const remaining = maxSelfies - selfies.length;
    const errors: string[] = [];

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      const validationError = isValidImageFile(file);
      if (validationError) {
        errors.push(validationError);
        continue;
      }
      newSelfies.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(" "));
    } else {
      setErrorMessage("");
    }

    if (newSelfies.length > 0) {
      setSelfies((prev) => [...prev, ...newSelfies]);
    }

    // Reset inputs so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
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
    if (requireLogin && !session) {
      toast.warning(
        "This album is private. Please sign in first so we can verify access before searching.",
      );
      router.push(
        `/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

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
        {requireLogin && !session && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 mt-0.5 shrink-0 text-destructive" />
            <p>
              This album is private. Sign in to upload a selfie and search for
              your photos.
            </p>
          </div>
        )}
        <div className="text-center">
          <h2 className="text-lg font-serif text-balance">
            Upload a selfie to find your photos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ll match your face to find photos of you in this album
          </p>
        </div>

        {/* Upload Options */}
        <div className="flex flex-col gap-3">
          {/* Take Photo Button (camera capture) */}
          <div
            className={cn(
              "relative flex md:hidden items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer",
              "transition-colors duration-200 hover:border-primary/50 hover:bg-muted/5",
              selfies.length >= maxSelfies && "pointer-events-none opacity-50",
            )}
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="size-6 text-muted-foreground/60" />
            <div className="text-left">
              <p className="font-medium text-foreground">Take Photo</p>
              <p className="text-xs text-muted-foreground">
                Open camera to take a selfie
              </p>
            </div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="sr-only"
              onChange={handleFileSelect}
              disabled={selfies.length >= maxSelfies}
            />
          </div>

          {/* Upload Photo Button (gallery picker) */}
          <div
            className={cn(
              "relative flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer",
              "transition-colors duration-200 hover:border-primary/50 hover:bg-muted/5",
              selfies.length >= maxSelfies && "pointer-events-none opacity-50",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-6 text-muted-foreground/60" />
            <div className="text-left">
              <p className="font-medium text-foreground">Upload Photo</p>
              <p className="text-xs text-muted-foreground">
                Choose from your gallery &middot; {selfies.length}/{maxSelfies}
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
        </div>

        {/* Validation Errors */}
        {errorMessage && step === "upload" && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

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
