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
  let downloadUrl: URL;
  try {
    downloadUrl = new URL(url);
  } catch (error) {
    return new NextResponse("Invalid URL format", { status: 400 });
  }

  let allowedUrl: URL;
  try {
    allowedUrl = new URL(R2_PUBLIC_URL);
  } catch (error) {
    console.error(
      "[api/download] Server configuration error: Invalid R2_PUBLIC_URL",
      error,
    );
    return new NextResponse("Server configuration error", { status: 500 });
  }

  if (downloadUrl.origin !== allowedUrl.origin) {
    return new NextResponse("Unauthorized download domain", { status: 403 });
  }

  // Ensure the requested pathname is within the allowed base path
  const normalizedAllowedPath = allowedUrl.pathname.endsWith("/")
    ? allowedUrl.pathname
    : allowedUrl.pathname + "/";

  const isAtOrUnderAllowedPath =
    downloadUrl.pathname === allowedUrl.pathname ||
    downloadUrl.pathname.startsWith(normalizedAllowedPath);

  if (!isAtOrUnderAllowedPath) {
    return new NextResponse("Unauthorized download path", { status: 403 });
  }

  try {
    const response = await fetch(url, { redirect: "manual" });

    if (response.status >= 300 && response.status < 400) {
      return new NextResponse(
        "Redirects are not allowed for security reasons",
        { status: 403 },
      );
    }

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";
    const contentLength = response.headers.get("Content-Length");

    if (!response.body) {
      return new NextResponse("Failed to get response body", { status: 500 });
    }

    // Sanitize filename to prevent header injection
    const sanitized = (filename || "image.jpg")
      .replace(/[\r\n]/g, "") // Strip CR/LF
      .replace(/"/g, "") // Strip quotes
      .trim() || "image.jpg";

    const encoded = encodeURIComponent(sanitized);

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${sanitized}"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    if (contentLength) {
      headers["Content-Length"] = contentLength;
    }

    return new NextResponse(response.body, { headers });
  } catch (error) {
    console.error("[api/download] Proxy error:", error);
    return new NextResponse("Internal server error during download", {
      status: 500,
    });
  }
}
