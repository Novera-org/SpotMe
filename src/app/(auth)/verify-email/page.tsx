import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getVerifyState,
  normalizeAuthCallbackUrl,
} from "@/lib/auth/verify-state";
import { isTokenExpiredError } from "@/lib/auth/error-messages";
import { VerificationResendForm } from "@/components/auth/verification-resend-form";
import { processLogger } from "@/lib/logger";

type SearchParamValue = string | string[] | undefined;
type SearchParams = Promise<Record<string, SearchParamValue>>;

function getSearchParamValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function buildSignInHref(callbackUrl: string) {
  return `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

function getAuthErrorDetails(error: unknown) {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const body =
      record.body && typeof record.body === "object"
        ? (record.body as Record<string, unknown>)
        : null;

    return {
      code:
        typeof body?.code === "string"
          ? body.code
          : typeof record.code === "string"
            ? record.code
            : null,
      message:
        typeof body?.message === "string"
          ? body.message
          : typeof record.message === "string"
            ? record.message
            : null,
    };
  }

  if (error instanceof Error) {
    return { code: null, message: error.message };
  }

  return { code: null, message: null };
}

function tryDecodeEmailFromToken(token: string) {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) {
      return null;
    }

    const normalized = payloadSegment
      .replaceAll("-", "+")
      .replaceAll("_", "/")
      .padEnd(Math.ceil(payloadSegment.length / 4) * 4, "=");
    const payload = JSON.parse(
      Buffer.from(normalized, "base64").toString("utf-8"),
    ) as { email?: unknown };

    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const verifyState = await getVerifyState();
  const token = getSearchParamValue(params.token);
  const callbackUrl = token
    ? normalizeAuthCallbackUrl(
        getSearchParamValue(params.callbackUrl) ??
          getSearchParamValue(params.callbackURL),
      )
    : verifyState?.callbackUrl ?? normalizeAuthCallbackUrl(null);
  const email = token
    ? tryDecodeEmailFromToken(token) ?? verifyState?.email ?? null
    : verifyState?.email ?? null;

  let status: "pending" | "success" | "expired" | "invalid" = "pending";

  if (token) {
    try {
      await auth.api.verifyEmail({
        query: { token },
        headers: await headers(),
      });
      status = "success";
    } catch (error) {
      const details = getAuthErrorDetails(error);
      processLogger.debug("[verify-email] Verification failed.", details);
      status = isTokenExpiredError(error) ? "expired" : "invalid";
    }
  }

  const signInHref = buildSignInHref(callbackUrl);

  return (
    <div className="auth-card shadow-lg bg-card/50 backdrop-blur-md max-w-xl">
      {status === "pending" && (
        <>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-1 tracking-tight">
            Check your email
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {email
              ? `We sent a verification link to ${email}. Open it to finish setting up your account.`
              : "Use the form below to send yourself a fresh verification link."}
          </p>
          <VerificationResendForm callbackUrl={callbackUrl} initialEmail={email} />
          <p className="auth-footer">
            Already verified?{" "}
            <Link href={signInHref} className="auth-link">
              Go to sign in
            </Link>
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-1 tracking-tight">
            Email verified
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Your email has been verified. You can sign in now and continue.
          </p>
          <Link
            href={signInHref}
            className="inline-flex w-full items-center justify-center border border-border px-4 py-2 font-semibold"
          >
            Continue to sign in
          </Link>
        </>
      )}

      {status === "expired" && (
        <>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-1 tracking-tight">
            Verification link expired
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            That link is no longer valid. Request a fresh verification email below.
          </p>
          <VerificationResendForm callbackUrl={callbackUrl} initialEmail={email} />
          <p className="auth-footer">
            Want to try signing in instead?{" "}
            <Link href={signInHref} className="auth-link">
              Go to sign in
            </Link>
          </p>
        </>
      )}

      {status === "invalid" && (
        <>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-1 tracking-tight">
            Verification link invalid
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            That verification link could not be used. You can request a new one below.
          </p>
          <VerificationResendForm callbackUrl={callbackUrl} initialEmail={email} />
          <p className="auth-footer">
            Return to{" "}
            <Link href={signInHref} className="auth-link">
              sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
