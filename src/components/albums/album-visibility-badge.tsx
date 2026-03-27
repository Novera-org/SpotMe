import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";

interface AlbumVisibilityBadgeProps {
  visibility: "public" | "private" | string;
}

export function AlbumVisibilityBadge({ visibility }: AlbumVisibilityBadgeProps) {
  const normalized = visibility?.toLowerCase() === "public" ? "public" : "private";
  const variant = normalized === "public" ? "default" : "secondary";
  const label = normalized === "public" ? "Public" : "Private";
  const Icon = normalized === "public" ? Eye : EyeOff;

  return (
    <Badge
      variant={variant}
      className={
        normalized === "public"
          ? "capitalize gap-1.5 bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
          : "capitalize gap-1.5 bg-slate-500/15 text-slate-300 border-slate-500/30"
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
