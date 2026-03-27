const INVALID_R2_PUBLIC_URL_MESSAGE =
  '[Config] Invalid R2_PUBLIC_URL: "%s". No image host will be configured.';

export function getConfiguredR2ImageHostname(
  r2PublicUrl = process.env.R2_PUBLIC_URL,
) {
  if (!r2PublicUrl) {
    return null;
  }

  try {
    return new URL(r2PublicUrl).hostname;
  } catch {
    return null;
  }
}

export function logInvalidR2PublicUrl(r2PublicUrl = process.env.R2_PUBLIC_URL) {
  if (!r2PublicUrl) {
    return;
  }

  console.warn(INVALID_R2_PUBLIC_URL_MESSAGE.replace("%s", r2PublicUrl));
}
