const INVALID_EMAIL_OR_PASSWORD = "Invalid email or password";
const EMAIL_NOT_VERIFIED = "Email not verified";
const INVALID_PASSWORD = "Invalid password";
const PASSWORD_TOO_SHORT = "Password too short";
const PASSWORD_TOO_LONG = "Password too long";
const TOKEN_EXPIRED = "Token expired";
const INVALID_TOKEN = "Invalid token";
const CREDENTIAL_ACCOUNT_NOT_FOUND = "Credential account not found";

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "";
}

export function isMessage(error: unknown, expected: string) {
  return getErrorMessage(error).includes(expected);
}

export function isInvalidEmailOrPasswordError(error: unknown) {
  return isMessage(error, INVALID_EMAIL_OR_PASSWORD);
}

export function isEmailNotVerifiedError(error: unknown) {
  return isMessage(error, EMAIL_NOT_VERIFIED);
}

export function isInvalidPasswordError(error: unknown) {
  return isMessage(error, INVALID_PASSWORD);
}

export function isPasswordTooShortError(error: unknown) {
  return isMessage(error, PASSWORD_TOO_SHORT);
}

export function isPasswordTooLongError(error: unknown) {
  return isMessage(error, PASSWORD_TOO_LONG);
}

export function isTokenExpiredError(error: unknown) {
  return isMessage(error, TOKEN_EXPIRED);
}

export function isInvalidTokenError(error: unknown) {
  return isMessage(error, INVALID_TOKEN);
}

export function isCredentialAccountNotFoundError(error: unknown) {
  return isMessage(error, CREDENTIAL_ACCOUNT_NOT_FOUND);
}
