import { ALBUM_STATUS } from "@/config/constants";
import { AlbumStatus } from "@/types";

interface AlbumStatusBadgeProps {
  status: AlbumStatus | string;
}

export function AlbumStatusBadge({ status }: AlbumStatusBadgeProps) {
  let badgeClass = "badge badge-unknown";
  let label = status;

  if (status === ALBUM_STATUS.ACTIVE) {
    badgeClass = "badge badge-active";
  } else if (status === ALBUM_STATUS.ARCHIVED) {
    badgeClass = "badge badge-archived";
  } else if (status === ALBUM_STATUS.DRAFT) {
    badgeClass = "badge badge-draft";
  } else {
    label = "Unknown";
  }

  return <span className={badgeClass}>{label}</span>;
}
