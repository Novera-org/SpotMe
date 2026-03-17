import { ALBUM_STATUS } from "@/config/constants";
import { AlbumStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

interface AlbumStatusBadgeProps {
  status: AlbumStatus | string;
}

export function AlbumStatusBadge({ status }: AlbumStatusBadgeProps) {
  let variant: "default" | "secondary" | "outline" | "destructive" = "destructive";
  let label = status;

  if (status === ALBUM_STATUS.ACTIVE) {
    variant = "default";
  } else if (status === ALBUM_STATUS.ARCHIVED) {
    variant = "outline";
  } else if (status === ALBUM_STATUS.DRAFT) {
    variant = "secondary";
  } else {
    label = "Unknown";
  }

  return <Badge variant={variant} className="capitalize">{label}</Badge>;
}
