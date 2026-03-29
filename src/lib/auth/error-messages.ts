import { auth } from "@/lib/auth";

type BetterAuthErrorCode = keyof typeof auth.$ERROR_CODES;

function getErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code;
  }

  return "";
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "";
}

function matchesError(error: unknown, expectedCode: BetterAuthErrorCode) {
  const expected = auth.$ERROR_CODES[expectedCode];

  if (getErrorCode(error) === expected.code) {
    return true;
  }

  /**
   * Better Auth v1.5.2 exposes structured error codes, but some server-action
   * call sites can still surface wrapped errors where only the message survives.
   * Keep this fallback until integration tests cover every thrown shape we rely on.
   */
  return getErrorMessage(error).includes(expected.message);
}

export function isInvalidEmailOrPasswordError(error: unknown) {
  return matchesError(error, "INVALID_EMAIL_OR_PASSWORD");
}

export function isEmailNotVerifiedError(error: unknown) {
  return matchesError(error, "EMAIL_NOT_VERIFIED");
}

export function isInvalidPasswordError(error: unknown) {
  return matchesError(error, "INVALID_PASSWORD");
}

export function isPasswordTooShortError(error: unknown) {
  return matchesError(error, "PASSWORD_TOO_SHORT");
}

export function isPasswordTooLongError(error: unknown) {
  return matchesError(error, "PASSWORD_TOO_LONG");
}

export function isTokenExpiredError(error: unknown) {
  return matchesError(error, "TOKEN_EXPIRED");
}

export function isInvalidTokenError(error: unknown) {
  return matchesError(error, "INVALID_TOKEN");
}

export function isCredentialAccountNotFoundError(error: unknown) {
  return matchesError(error, "CREDENTIAL_ACCOUNT_NOT_FOUND");
}
