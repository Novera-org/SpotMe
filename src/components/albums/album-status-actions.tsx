"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAlbum } from "@/actions/albums";
import { ALBUM_STATUS } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, PlayCircle, Archive, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlbumStatusActionsProps {
  albumId: string;
  currentStatus: string;
  compact?: boolean;
}

export function AlbumStatusActions({ albumId, currentStatus, compact = false }: AlbumStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusUpdate = (e: React.MouseEvent, newStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        await updateAlbum({ id: albumId, status: newStatus });
        router.refresh();
        toast.success(`Album status updated to ${newStatus}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update status");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Primary Action: Activate if Draft */}
      {currentStatus === ALBUM_STATUS.DRAFT && (
        <Button
          size={compact ? "sm" : "default"}
          onClick={(e) => handleStatusUpdate(e, ALBUM_STATUS.ACTIVE)}
          disabled={isPending}
          className={cn(
            "gap-2 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95",
            compact && "h-8 px-3 text-xs"
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {compact ? "Activate" : "Activate Album"}
        </Button>
      )}

      {/* Secondary Actions using outline/ghost variants */}
      {currentStatus === ALBUM_STATUS.ACTIVE && (
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={(e) => handleStatusUpdate(e, ALBUM_STATUS.ARCHIVED)}
          disabled={isPending}
          className={cn(
            "gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors",
            compact && "h-8 px-3 text-xs"
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          {compact ? "Archive" : "Archive Album"}
        </Button>
      )}

      {currentStatus === ALBUM_STATUS.ARCHIVED && (
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={(e) => handleStatusUpdate(e, ALBUM_STATUS.DRAFT)}
          disabled={isPending}
          className={cn(
            "gap-2 transition-colors",
            compact && "h-8 px-3 text-xs"
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Undo2 className="h-4 w-4" />
          )}
          {compact ? "Draft" : "Restore to Draft"}
        </Button>
      )}

      {/* For Active, allow reverting to Draft if needed (Secondary, only if not compact) */}
      {currentStatus === ALBUM_STATUS.ACTIVE && !compact && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleStatusUpdate(e, ALBUM_STATUS.DRAFT)}
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Undo2 className="h-3.5 w-3.5" />
          )}
          Set to Draft
        </Button>
      )}
    </div>
  );
}
