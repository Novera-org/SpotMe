import type {
  AIFaceService,
  FaceIndexRequest,
  FaceIndexResult,
  FaceMatchRequest,
  FaceMatchResult,
} from "./types";

const DEFAULT_AI_SERVICE_URL = "https://dalychebbi-spotme.hf.space";
const REQUEST_TIMEOUT_MS = 120_000;

interface UploadImagesResponse {
  results?: Array<{
    imageId: string;
    facesDetected?: number;
    facesIndexed?: number;
  }>;
  error?: string;
}

interface SearchFacesResponse {
  matches?: Array<{
    imageId: string;
    score?: number;
  }>;
  matchedImageIds?: string[];
  error?: string;
  facesDetected?: number;
}

export class HFSpacesFaceService implements AIFaceService {
  private readonly baseUrl: string;

  constructor(baseUrl = process.env.AI_SERVICE_URL || DEFAULT_AI_SERVICE_URL) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  }

  async indexImages(request: FaceIndexRequest): Promise<FaceIndexResult[]> {
    if (request.images.length === 0) {
      return [];
    }

    const images = await Promise.all(
      request.images.map(async (image) => ({
        imageId: image.imageId,
        imageData: await toDataUrl(image.imageUrl),
      })),
    );

    const data = await this.requestJson<UploadImagesResponse>("/upload-images", {
      method: "POST",
      body: JSON.stringify({
        albumId: request.albumId,
        images,
      }),
    });

    return (data.results ?? []).map((result) => ({
      imageId: result.imageId,
      facesDetected: result.facesDetected ?? 0,
      facesIndexed: result.facesIndexed ?? 0,
    }));
  }

  async findMatches(request: FaceMatchRequest): Promise<FaceMatchResult[]> {
    const imageData = await toDataUrl(request.selfieUrl);

    const data = await this.requestJson<SearchFacesResponse>("/search-faces", {
      method: "POST",
      body: JSON.stringify({
        albumId: request.albumId,
        imageData,
      }),
    });

    if (Array.isArray(data.matches) && data.matches.length > 0) {
      return data.matches.map((match) => ({
        imageId: match.imageId,
        similarityScore: match.score ?? 0,
      }));
    }

    return (data.matchedImageIds ?? []).map((imageId) => ({
      imageId,
      similarityScore: 0,
    }));
  }

  private async requestJson<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init.headers,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });

    const responseText = await response.text();
    const data = responseText ? safeJsonParse(responseText) : null;

    if (!response.ok) {
      const errorMessage =
        isErrorResponse(data) && data.error
          ? data.error
          : `AI service request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data as T;
  }
}

async function toDataUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  const response = await fetch(imageUrl, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image data from ${imageUrl}`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const imageBuffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${imageBuffer.toString("base64")}`;
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isErrorResponse(
  value: unknown,
): value is { error?: string; facesDetected?: number } {
  return typeof value === "object" && value !== null;
}
