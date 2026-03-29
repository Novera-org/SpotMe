import Link from "next/link";
import { getResetPasswordTokenStatus } from "@/lib/auth/reset-password";
import { normalizeAuthCallbackUrl } from "@/lib/auth/verify-state";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

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

function buildForgotPasswordHref(callbackUrl: string) {
  return `/forgot-password?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token = getSearchParamValue(params.token)?.trim() ?? "";
  const callbackUrl = normalizeAuthCallbackUrl(
    getSearchParamValue(params.callbackUrl),
  );
  const signInHref = buildSignInHref(callbackUrl);
  const forgotPasswordHref = buildForgotPasswordHref(callbackUrl);

  let status: "valid" | "expired" | "invalid" = "invalid";

  if (token) {
    status = await getResetPasswordTokenStatus(token);
  }

  if (status === "valid") {
    return (
      <div className="auth-card max-w-xl bg-card/50 shadow-lg backdrop-blur-md">
        <ResetPasswordForm
          token={token}
          callbackUrl={callbackUrl}
          forgotPasswordHref={forgotPasswordHref}
        />
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="auth-card max-w-xl bg-card/50 shadow-lg backdrop-blur-md">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground font-serif">
          Reset link expired
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          That password reset link has expired. Request a fresh one to continue.
        </p>
        <Link
          href={forgotPasswordHref}
          className="inline-flex w-full items-center justify-center border border-border px-4 py-2 font-semibold"
        >
          Request a new reset link
        </Link>
        <p className="auth-footer">
          Return to{" "}
          <Link href={signInHref} className="auth-link">
            sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card max-w-xl bg-card/50 shadow-lg backdrop-blur-md">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground font-serif">
        Reset link invalid
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        That password reset link could not be used. Request a fresh one to try again.
      </p>
      <Link
        href={forgotPasswordHref}
        className="inline-flex w-full items-center justify-center border border-border px-4 py-2 font-semibold"
      >
        Request a new reset link
      </Link>
      <p className="auth-footer">
        Return to{" "}
        <Link href={signInHref} className="auth-link">
          sign in
        </Link>
      </p>
    </div>
  );
}
