import { db } from "@/lib/db";
import { shareLinks, albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { NextRequest, NextResponse } from "next/server";
import { APP_URL } from "@/config/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Lookup share link joined with album for slug
  const [link] = await db
    .select({
      code: shareLinks.code,
      isActive: shareLinks.isActive,
      expiresAt: shareLinks.expiresAt,
      slug: albums.slug,
    })
    .from(shareLinks)
    .innerJoin(albums, eq(shareLinks.albumId, albums.id))
    .where(eq(shareLinks.code, code));

  if (!link || !link.isActive) {
    return new NextResponse("Share link not found or inactive", {
      status: 404,
    });
  }

  if (link.expiresAt && link.expiresAt < new Date()) {
    return new NextResponse("Share link expired", { status: 410 });
  }

  const albumUrl = `${APP_URL}/album/${link.slug}?ref=${link.code}`;

  try {
    const qrBuffer = await QRCode.toBuffer(albumUrl, {
      width: 400,
      margin: 2,
    });

    return new NextResponse(new Uint8Array(qrBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to generate QR code", { status: 500 });
  }
}
