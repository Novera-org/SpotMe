import { ALBUM_STATUS } from "@/config/constants";

interface AlbumStatusBadgeProps {
  status: string;
}

export function AlbumStatusBadge({ status }: AlbumStatusBadgeProps) {
  let badgeClass = "badge badge-draft";

  if (status === ALBUM_STATUS.ACTIVE) {
    badgeClass = "badge badge-active";
  } else if (status === ALBUM_STATUS.ARCHIVED) {
    badgeClass = "badge badge-archived";
  }

  return <span className={badgeClass}>{status}</span>;
}
