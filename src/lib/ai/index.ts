import type { AIFaceService } from "./types";
import { MockFaceService } from "./mock-service";

/**
 * Factory function to get the AI face recognition service.
 *
 * Currently returns the mock service. To swap to the real service:
 *
 * ```ts
 * import { HFSpacesFaceService } from "./hf-spaces-service";
 *
 * export function getAIService(): AIFaceService {
 *   return new HFSpacesFaceService(process.env.AI_SERVICE_URL!);
 * }
 * ```
 */
export function getAIService(): AIFaceService {
  return new MockFaceService();
}

export type { AIFaceService, FaceMatchRequest, FaceMatchResult } from "./types";
