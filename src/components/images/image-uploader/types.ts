export type FileStatus =
  | "pending"
  | "uploading"
  | "confirming"
  | "done"
  | "error";

export interface TrackedFile {
  file: File;
  id: string;
  progress: number;
  status: FileStatus;
  error?: string;
}

export interface InsertedImage {
  id: string;
  albumId: string;
  r2Url: string;
  filename: string;
  status: string;
}

export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_BATCH_SIZE = 500;
