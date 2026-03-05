import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { guests } from "@/lib/db/schema";
import { GUEST_SESSION_MAX_AGE } from "@/config/constants";

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

  const deleted = await db
    .delete(guests)
    .where(lt(guests.createdAt, cutoff))
    .returning({ id: guests.id });

  return NextResponse.json({ deleted: deleted.length });
}
