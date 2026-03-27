import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";

type ActivityAction =
  | "album_viewed"
  | "search_started"
  | "match_found"
  | "image_downloaded";
type ActorType = "admin" | "user" | "guest";

export async function logActivity(params: {
  albumId: string;
  action: ActivityAction;
  actorType: ActorType;
  actorId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.insert(activityLog).values({
      albumId: params.albumId,
      action: params.action,
      actorType: params.actorType,
      actorId: params.actorId || null,
      metadata: params.metadata || null,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
    // Never let logging failures break the main flow
  }
}
