import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { guests } from "@/lib/db/schema";
import { GUEST_SESSION_MAX_AGE } from "@/config/constants";
import { processLogger } from "@/lib/logger";

/**
 * GET /api/cron/cleanup-guests
 * Deletes guest rows older than 30 days.
 * Protected by CRON_SECRET in the Authorization header.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Calculate the cutoff date (30 days ago)
  const cutoff = new Date(Date.now() - GUEST_SESSION_MAX_AGE * 1000);

  try {
    const result = await db
      .delete(guests)
      .where(lt(guests.createdAt, cutoff));

    return NextResponse.json({ deleted: result.rowCount });
  } catch (error) {
    processLogger.error(
      `[cron-cleanup-guests] Failed to delete guests. Cutoff: ${cutoff.toISOString()}`,
      error
    );
    return NextResponse.json(
      { error: "failed to delete guests" },
      { status: 500 }
    );
  }
}
