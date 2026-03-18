"use client";

import { useState, useCallback } from "react";
import { createShareLink, deactivateShareLink } from "@/actions/share-links";
import { APP_URL } from "@/config/constants";
import { toast } from "sonner";
import { ShareLink } from "./types";

interface UseShareLinksProps {
  albumId: string;
  slug: string;
  initialLinks: ShareLink[];
}

export function useShareLinks({ albumId, slug, initialLinks }: UseShareLinksProps) {
  const [links, setLinks] = useState(initialLinks);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    try {
      const newLink = await createShareLink({ albumId });
      setLinks((prev) => [...prev, newLink]);
      toast.success("Share link created successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create share link");
    } finally {
      setIsCreating(false);
    }
  }, [albumId]);

  const handleDeactivate = useCallback(async (linkId: string) => {
    try {
      await deactivateShareLink(linkId);
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, isActive: false } : l))
      );
      toast.success("Share link deactivated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate share link");
    }
  }, []);

  const handleCopy = useCallback(async (code: string, linkId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : APP_URL;
    const url = `${origin}/album/${slug}?ref=${code}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(linkId);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
      const result = prompt("Copy this link:", url);
      if (result !== null) {
          toast.success("Link copied");
      }
    }
  }, [slug]);

  return {
    links,
    isCreating,
    copiedId,
    handleCreate,
    handleDeactivate,
    handleCopy,
  };
}
