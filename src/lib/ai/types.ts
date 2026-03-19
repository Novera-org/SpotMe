export interface FaceMatchRequest {
  selfieUrl: string;
  albumId: string;
}

export interface FaceMatchResult {
  imageId: string;
  faceId: string;
  similarityScore: number;
}

export interface AIFaceService {
  findMatches(request: FaceMatchRequest): Promise<FaceMatchResult[]>;
}
