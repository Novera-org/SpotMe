"use client";

import { useState } from "react";
import { createShareLink, deactivateShareLink } from "@/actions/share-links";
import { APP_URL } from "@/config/constants";
import { Button, buttonVariants } from "@/components/ui/button";

interface ShareLink {
  id: string;
  albumId: string;
  code: string;
  label: string | null;
  isActive: boolean;
  accessCount: number;
  createdAt: Date;
  expiresAt: Date | null;
}

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
  const [links, setLinks] = useState(initialLinks);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCreate() {
    setIsCreating(true);
    try {
      const newLink = await createShareLink({ albumId });
      setLinks((prev) => [...prev, newLink]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create share link");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeactivate(linkId: string) {
    try {
      await deactivateShareLink(linkId);
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, isActive: false } : l))
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to deactivate share link"
      );
    }
  }

  async function handleCopy(code: string, linkId: string) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : APP_URL;
    const url = `${origin}/album/${slug}?ref=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(linkId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
      prompt("Copy this link:", url);
    }
  }

  return (
    <div className="share-links-section">
      <div className="share-links-header">
        <h3>Share Links</h3>
        <Button
          onClick={handleCreate}
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "+ New Share Link"}
        </Button>
      </div>

      {links.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          No share links yet. Create one to start sharing this album.
        </p>
      ) : (
        <div className="share-links-list">
          {links.map((link) => (
            <div key={link.id} className="share-link-item">
              <div className="share-link-info">
                <code className="share-link-code">{link.code}</code>
                {link.label && (
                  <span className="share-link-label">{link.label}</span>
                )}
                <span className="share-link-meta">
                  {link.accessCount} views ·{" "}
                  {link.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="share-link-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(link.code, link.id)}
                >
                  {copiedId === link.id ? "Copied!" : "Copy Link"}
                </Button>
                <a
                  href={`/api/qr/${link.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  QR Code
                </a>
                {link.isActive && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeactivate(link.id)}
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
