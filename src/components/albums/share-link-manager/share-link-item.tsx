"use client";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { Copy, QrCode, XCircle, RotateCcw } from "lucide-react";
import { ShareLink } from "./types";
import { cn } from "@/lib/utils";

interface ShareLinkItemProps {
  link: ShareLink;
  isCopied: boolean;
  onCopy: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}

export function ShareLinkItem({
  link,
  isCopied,
  onCopy,
  onDeactivate,
  onReactivate,
}: ShareLinkItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/5 border border-border rounded-xl transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:scale-[1.005] hover:shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)] hover:border-primary/30">
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <code className="px-2 py-0.5 rounded bg-muted/20 text-primary font-mono text-sm font-bold">
            {link.code}
          </code>
          {link.label && (
            <span className="text-sm font-medium text-foreground truncate">
              {link.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] h-4">
            {link.accessCount} views
          </Badge>
          <Badge
            variant={link.isActive ? "secondary" : "outline"}
            className={cn("text-[10px] h-4", !link.isActive && "opacity-50")}
          >
            {link.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="h-8 text-xs gap-1.5"
        >
          <Copy className="size-3.5" data-icon="inline-start" />
          {isCopied ? "Copied!" : "Copy Link"}
        </Button>
        <a
          href={`/api/qr/${link.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "h-8 text-xs gap-1.5",
          })}
        >
          <QrCode className="size-3.5" data-icon="inline-start" />
          QR Code
        </a>
        {link.isActive ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeactivate}
            className="h-8 text-xs gap-1.5 border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive"
          >
            <XCircle className="size-3.5" data-icon="inline-start" />
            Deactivate
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onReactivate}
            className="h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/15 hover:text-emerald-500"
          >
            <RotateCcw className="size-3.5" data-icon="inline-start" />
            Reactivate
          </Button>
        )}
      </div>
    </div>
  );
}
