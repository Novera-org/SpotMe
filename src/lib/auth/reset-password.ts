import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { verification } from "@/lib/db/schema";

export type ResetPasswordTokenStatus = "valid" | "expired" | "invalid";

function buildResetPasswordIdentifier(token: string) {
  return `reset-password:${token}`;
}

export async function getResetPasswordTokenStatus(
  token: string,
): Promise<ResetPasswordTokenStatus> {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    return "invalid";
  }

  const tokenRecord = await db.query.verification.findFirst({
    where: eq(
      verification.identifier,
      buildResetPasswordIdentifier(normalizedToken),
    ),
  });

  if (!tokenRecord) {
    return "invalid";
  }

  if (tokenRecord.expiresAt < new Date()) {
    return "expired";
  }

  return "valid";
}
