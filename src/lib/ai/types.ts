export interface FaceMatchRequest {
  selfieUrl: string;
  albumId: string;
}

export interface FaceIndexImage {
  imageId: string;
  imageUrl: string;
}

export interface FaceIndexRequest {
  albumId: string;
  images: FaceIndexImage[];
}

export interface FaceIndexResult {
  imageId: string;
  facesDetected: number;
  facesIndexed: number;
}

export interface FaceMatchResult {
  imageId: string;
  similarityScore: number;
}

export interface AIFaceService {
  indexImages(request: FaceIndexRequest): Promise<FaceIndexResult[]>;
  findMatches(request: FaceMatchRequest): Promise<FaceMatchResult[]>;
}
