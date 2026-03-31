import type { AIFaceService } from "./types";
import { HFSpacesFaceService } from "./hf-spaces-service";

/**
 * Factory function to get the AI face recognition service.
 *
 */
export function getAIService(): AIFaceService {
  return new HFSpacesFaceService();
}

export type {
  AIFaceService,
  FaceIndexImage,
  FaceIndexRequest,
  FaceIndexResult,
  FaceMatchRequest,
  FaceMatchResult,
} from "./types";
