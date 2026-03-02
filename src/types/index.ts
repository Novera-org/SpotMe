import {
  ALBUM_STATUS,
  IMAGE_STATUS,
  SEARCH_STATUS,
  USER_ROLE,
} from "@/config/constants";

export type AlbumStatus = (typeof ALBUM_STATUS)[keyof typeof ALBUM_STATUS];
export type ImageStatus = (typeof IMAGE_STATUS)[keyof typeof IMAGE_STATUS];
export type SearchStatus = (typeof SEARCH_STATUS)[keyof typeof SEARCH_STATUS];
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export interface MatchResult {
  imageId: string;
  faceId: string;
  similarityScore: number;
}
