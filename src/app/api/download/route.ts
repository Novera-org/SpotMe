import { NextResponse } from "next/server";
import { R2_PUBLIC_URL } from "@/lib/storage/r2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "image.jpg";

  if (!url) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  // Security: Only allow downloads from our public R2 URL
  const publicUrlBase = R2_PUBLIC_URL.endsWith("/")
    ? R2_PUBLIC_URL.slice(0, -1)
    : R2_PUBLIC_URL;

  if (!url.startsWith(publicUrlBase)) {
    return new NextResponse("Unauthorized download domain", { status: 403 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";
    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[api/download] Proxy error:", error);
    return new NextResponse("Internal server error during download", {
      status: 500,
    });
  }
}
