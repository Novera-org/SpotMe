"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/loading-button";
import { Share2, Plus } from "lucide-react";
import { ShareLink } from "./types";
import { useShareLinks } from "./use-share-links";
import { ShareLinkItem } from "./share-link-item";

interface ShareLinkManagerProps {
  albumId: string;
  slug: string;
  shareLinks: ShareLink[];
}

export function ShareLinkManager({
  albumId,
  slug,
  shareLinks: initialLinks,
}: ShareLinkManagerProps) {
  const {
    links,
    isCreating,
    copiedId,
    handleCreate,
    handleDeactivate,
    handleReactivate,
    handleCopy,
  } = useShareLinks({ albumId, slug, initialLinks });

  return (
    <Card
      className="border-border bg-card overflow-hidden"
      style={{
        animation: "fade-up 0.5s ease-out forwards",
        animationDelay: "0.1s",
        opacity: 0,
      }}
    >
      <CardHeader className="bg-muted/10 border-b border-border flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-xl font-serif text-balance">
            <Share2 className="text-primary size-5" />
            Share Links
          </CardTitle>
          <CardDescription>
            Manage access codes for this album
          </CardDescription>
        </div>
        <LoadingButton
          onClick={handleCreate}
          isLoading={isCreating}
          loadingText="Creating…"
          size="sm"
          className="gap-1.5"
        >
          <Plus className="size-4" data-icon="inline-start" />
          New link
        </LoadingButton>
      </CardHeader>
      <CardContent className="pt-6">
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2 border-2 border-dashed border-border rounded-xl">
             <p className="text-muted-foreground text-sm font-sans max-w-[250px]">
              No share links yet. Create one to start sharing this album.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <ShareLinkItem
                key={link.id}
                link={link}
                isCopied={copiedId === link.id}
                onCopy={() => handleCopy(link.code, link.id)}
                onDeactivate={() => handleDeactivate(link.id)}
                onReactivate={() => handleReactivate(link.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
