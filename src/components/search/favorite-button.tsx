"use client";

import { useState, useTransition } from "react";
import { toggleFavorite } from "@/actions/favorites";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  albumId: string;
  imageId: string;
  isSaved: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({
  albumId,
  imageId,
  isSaved: initialSaved,
  size = "md",
  className,
}: FavoriteButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Optimistic update
    setSaved((prev) => !prev);

    startTransition(async () => {
      try {
        const result = await toggleFavorite(albumId, imageId);
        setSaved(result.saved);
      } catch {
        // Revert on error
        setSaved((prev) => !prev);
      }
    });
  };

  const iconSize = size === "sm" ? "size-4" : "size-5";

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={saved ? "Remove from saved" : "Save photo"}
      className={cn(
        "rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur-md transition-all active:scale-90",
        saved
          ? "bg-red-500/20 border-red-400/40 text-red-400 hover:bg-red-500/30"
          : "text-white hover:bg-white/20",
        isPending && "opacity-60 pointer-events-none",
        className,
      )}
    >
      <Heart
        className={cn(iconSize, "transition-transform", saved && "fill-current")}
      />
    </button>
  );
}
