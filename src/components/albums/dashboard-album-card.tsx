"use client";

import { useRouter } from "next/navigation";
import { ImageIcon, Search, Download, Zap } from "lucide-react";
import { AlbumStatusBadge } from "@/components/albums/album-status-badge";
import { AlbumStatusActions } from "@/components/albums/album-status-actions";
import { AlbumVisibilityBadge } from "@/components/albums/album-visibility-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface DashboardAlbumCardProps {
  album: {
    albumId: string;
    title: string;
    status: string;
    visibility: "public" | "private";
    imageCount: number;
    searchCount: number;
    matchCount: number;
    downloadCount: number;
    createdAtLabel: string;
  };
  index: number;
}

export function DashboardAlbumCard({
  album,
  index,
}: DashboardAlbumCardProps) {
  const router = useRouter();

  const openAlbum = () => {
    router.push(`/dashboard/albums/${encodeURIComponent(album.albumId)}`);
  };

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={`Open album ${album.title}`}
      className="group cursor-pointer transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:border-primary/50 animate-fade-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{
        animationDelay: `${index * 0.05}s`,
      }}
      onClick={openAlbum}
      onKeyDown={(event) => {
        if (event.repeat) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openAlbum();
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-1 mr-2 flex-1">
          {album.title}
        </CardTitle>
        <div
          className="flex items-center gap-2"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <AlbumStatusBadge status={album.status} />
          <AlbumVisibilityBadge visibility={album.visibility} />
          <AlbumStatusActions
            albumId={album.albumId}
            currentStatus={album.status}
            compact
          />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricItem
            icon={<ImageIcon className="h-3.5 w-3.5" />}
            label="Images"
            value={album.imageCount}
          />
          <MetricItem
            icon={<Search className="h-3.5 w-3.5" />}
            label="Searches"
            value={album.searchCount}
          />
          <MetricItem
            icon={<Zap className="h-3.5 w-3.5" />}
            label="Matches"
            value={album.matchCount}
          />
          <MetricItem
            icon={<Download className="h-3.5 w-3.5" />}
            label="Downloads"
            value={album.downloadCount}
          />
        </div>
      </CardContent>
      <CardFooter className="pt-0 mt-auto text-xs text-muted-foreground border-t p-4 pb-4">
        Created on {album.createdAtLabel}
      </CardFooter>
    </Card>
  );
}

function MetricItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
      <div aria-hidden="true">{icon}</div>
      <span className="sr-only">{label}</span>
      <span className="font-medium text-foreground tabular-nums">
        {value.toLocaleString()}
      </span>
      <span className="hidden sm:inline" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
