import { cookies } from "next/headers";

export const DEFAULT_POST_VERIFY_PATH = "/account";

const VERIFY_STATE_COOKIE = "verify-state";
const VERIFY_STATE_MAX_AGE = 60 * 15;

type VerifyState = {
  email: string;
  callbackUrl: string;
};

export function normalizeAuthCallbackUrl(rawValue: string | null | undefined) {
  const value = rawValue?.trim();

  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return DEFAULT_POST_VERIFY_PATH;
}

export async function setVerifyState(input: VerifyState) {
  const cookieStore = await cookies();

  cookieStore.set(VERIFY_STATE_COOKIE, JSON.stringify(input), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/verify-email",
    maxAge: VERIFY_STATE_MAX_AGE,
  });
}

export async function getVerifyState() {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(VERIFY_STATE_COOKIE)?.value;

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<VerifyState>;

    if (
      typeof parsed.email !== "string" ||
      typeof parsed.callbackUrl !== "string"
    ) {
      return null;
    }

    return {
      email: parsed.email,
      callbackUrl: normalizeAuthCallbackUrl(parsed.callbackUrl),
    };
  } catch {
    return null;
  }
}
