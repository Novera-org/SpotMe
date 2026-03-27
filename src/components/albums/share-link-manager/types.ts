export interface ShareLink {
  id: string;
  albumId: string;
  code: string;
  label: string | null;
  isActive: boolean;
  accessCount: number;
  createdAt: Date;
  deactivatedAt: Date | null;
  expiresAt: Date | null;
}
