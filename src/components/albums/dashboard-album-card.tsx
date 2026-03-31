"use client";

import { useRouter } from "next/navigation";
import { ImageIcon, Search, Download, Zap } from "lucide-react";
import { AlbumStatusBadge } from "@/components/albums/album-status-badge";
import { AlbumStatusActions } from "@/components/albums/album-status-actions";
import { AlbumVisibilityBadge } from "@/components/albums/album-visibility-badge";


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
    previewImages?: string[];
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
    <div
      role="link"
      tabIndex={0}
      aria-label={`Open album ${album.title}`}
      className="group outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-up flex relative w-full aspect-[4/3] cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={openAlbum}
      onKeyDown={(event) => {
        if (event.repeat) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openAlbum();
        }
      }}
    >
      {/* 
        To prevent album clumping/intersection in CSS grids caused by absolute elements bleeding out,
        we constrain everything strictly inside this bounded 'pr-4 pb-4' wrapper which acts as internal margin for the 3D pages.
      */}
      <div className="relative w-full h-full pr-3 pb-3 transition-transform duration-300 group-hover:-translate-y-2">
        
        {/* Physical Paper Pages / Leaking Images */}
        {album.previewImages?.[1] && (
          <div className="absolute top-2 left-6 right-1 bottom-1 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-r-md transition-transform duration-500 pointer-events-none shadow-sm group-hover:translate-x-1 overflow-hidden">
            <img 
              src={album.previewImages[1]} 
              alt="" 
              className="w-full h-full object-cover opacity-80 mix-blend-multiply dark:mix-blend-overlay" 
              onError={(e) => {
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.style.display = 'none';
                }
              }}
            />
          </div>
        )}
        
        {album.previewImages?.[0] && (
          <div className="absolute top-4 left-6 right-0 bottom-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-r-md transition-transform duration-500 pointer-events-none shadow-md group-hover:translate-x-2 overflow-hidden">
            <img 
              src={album.previewImages[0]} 
              alt="" 
              className="w-full h-full object-cover opacity-90 mix-blend-multiply dark:mix-blend-overlay"
              onError={(e) => {
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.style.display = 'none';
                }
              }}
            />
          </div>
        )}

        {/* Thick Album Cover Shell */}
        <div className="absolute inset-0 right-3 bottom-3 bg-card border-[1.5px] border-border rounded-r-2xl rounded-l-sm shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-col justify-between overflow-hidden">
          
          {/* Top-Right Action Menu */}
          <div className="absolute top-3 right-3 z-30 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
             <AlbumStatusActions albumId={album.albumId} currentStatus={album.status} compact />
          </div>

          {/* Bound Book Spine */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-zinc-900 dark:bg-black border-r border-black/40 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
             {/* Crease lines */}
             <div className="absolute left-2 top-0 bottom-0 w-px bg-white/20" />
             <div className="absolute right-1 top-0 bottom-0 w-px bg-white/10" />
             <div className="absolute left-3 top-0 bottom-0 w-3 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
             
             {/* Text rotated along spine */}
             <span className="text-zinc-500 text-[9px] uppercase tracking-[0.3em] font-sans -rotate-90 whitespace-nowrap">
               SPOTME ALBUM
             </span>
          </div>

          {/* Album Cover Graphical Overlay */}
          <div className="absolute inset-0 ml-12 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none" />

          {/* The Plate Card describing the album contents */}
          <div className="relative z-20 mx-auto mt-auto mb-auto w-[calc(100%-4rem)] ml-[3.5rem] bg-background/95 backdrop-blur-md shadow-md border border-border/80 p-4 sm:p-5 flex flex-col gap-3 rounded-md">
            
            <div className="flex flex-col gap-1.5 text-center">
               <h3 className="text-xl font-serif font-bold line-clamp-2 leading-tight tracking-tight">
                 {album.title}
               </h3>
               <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
                 <AlbumStatusBadge status={album.status} />
                 <AlbumVisibilityBadge visibility={album.visibility} />
               </div>
            </div>
            
            <div className="h-[1px] w-full bg-border opacity-50 my-1" />

            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              <MetricItem icon={<ImageIcon className="h-3.5 w-3.5 shrink-0" />} label="Images" value={album.imageCount} />
              <MetricItem icon={<Search className="h-3.5 w-3.5 shrink-0" />} label="Searches" value={album.searchCount} />
              <MetricItem icon={<Zap className="h-3.5 w-3.5 shrink-0" />} label="Matches" value={album.matchCount} />
              <MetricItem icon={<Download className="h-3.5 w-3.5 shrink-0" />} label="Downloads" value={album.downloadCount} />
            </div>
          </div>
          
          <div className="z-20 w-auto ml-12 p-3 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-sans bg-black/5 dark:bg-white/5 border-t border-border">
            Created on {album.createdAtLabel}
          </div>
          
        </div>
      </div>
    </div>
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
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans truncate">
      <div aria-hidden="true" className="shrink-0">{icon}</div>
      <span className="font-medium text-foreground tabular-nums truncate">
        {value.toLocaleString()}
      </span>
      <span className="hidden sm:inline truncate" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
