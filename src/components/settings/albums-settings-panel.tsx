"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { updateAlbumSettingsEntry } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";

type AlbumSettingItem = {
  id: string;
  title: string;
  trackCount: number;
  visibility: "public" | "private";
  coverUrl: string | null;
};

interface AlbumSettingsPanelProps {
  initialAlbums: AlbumSettingItem[];
}

export function AlbumsSettingsPanel({ initialAlbums }: AlbumSettingsPanelProps) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [pendingAlbumId, setPendingAlbumId] = useState<string | null>(null);
  const [errorByAlbumId, setErrorByAlbumId] = useState<Record<string, string | null>>({});
  const [isPending, startTransition] = useTransition();

  const updateAlbumState = (albumId: string, updater: (current: AlbumSettingItem) => AlbumSettingItem) => {
    setAlbums((current) =>
      current.map((album) => (album.id === albumId ? updater(album) : album))
    );
  };

  const moveAlbum = (albumId: string, direction: "up" | "down") => {
    setAlbums((current) => {
      const index = current.findIndex((album) => album.id === albumId);
      if (index === -1) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = current.slice();
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });

    toast.success("Album order updated.");
  };

  const handleSaveAlbum = (event: React.FormEvent<HTMLFormElement>, album: AlbumSettingItem) => {
    event.preventDefault();
    setPendingAlbumId(album.id);
    setErrorByAlbumId((current) => ({ ...current, [album.id]: null }));

    startTransition(async () => {
      try {
        await updateAlbumSettingsEntry({
          albumId: album.id,
          title: album.title,
          visibility: album.visibility,
        });
        toast.success(`Saved "${album.title}".`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save album.";
        setErrorByAlbumId((current) => ({ ...current, [album.id]: message }));
        toast.error(message);
      } finally {
        setPendingAlbumId(null);
      }
    });
  };

  const handleCoverPlaceholder = () => {
    toast.info("Cover change UI is placeholder for now.");
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Album management</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Rename, update visibility, and reorder your albums.
        </p>
      </header>

      {albums.length === 0 && (
        <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">
          You do not have any albums yet.
        </div>
      )}

      <ul className="space-y-4">
        {albums.map((album, index) => (
          <li key={album.id} className="border border-border bg-card p-4 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 border border-border bg-muted/20 overflow-hidden">
                  {album.coverUrl ? (
                    <Image src={album.coverUrl} alt={album.title} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold">{album.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {album.trackCount} tracks • {album.visibility}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => moveAlbum(album.id, "up")}
                  aria-label="Move album up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={index === albums.length - 1}
                  onClick={() => moveAlbum(album.id, "down")}
                  aria-label="Move album down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(event) => handleSaveAlbum(event, album)}>
              <div className="space-y-1.5">
                <Label htmlFor={`title-${album.id}`}>Album title</Label>
                <Input
                  id={`title-${album.id}`}
                  value={album.title}
                  onChange={(event) =>
                    updateAlbumState(album.id, (current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`visibility-${album.id}`}>Visibility</Label>
                <select
                  id={`visibility-${album.id}`}
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  value={album.visibility}
                  onChange={(event) =>
                    updateAlbumState(album.id, (current) => ({
                      ...current,
                      visibility: event.target.value as "public" | "private",
                    }))
                  }
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" onClick={handleCoverPlaceholder}>
                  Change cover
                </Button>
                <LoadingButton
                  type="submit"
                  isLoading={isPending && pendingAlbumId === album.id}
                  loadingText="Saving..."
                >
                  Save album
                </LoadingButton>
              </div>

              {errorByAlbumId[album.id] && (
                <p className="text-sm text-destructive" role="alert">
                  {errorByAlbumId[album.id]}
                </p>
              )}
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
