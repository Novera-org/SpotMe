import { ResetLinkStatusCard } from "@/components/auth/reset-link-status-card";
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
        <ResetLinkStatusCard
          tokenStatus="expired"
          forgotPasswordHref={forgotPasswordHref}
          showSignIn
          signInHref={signInHref}
        />
      </div>
    );
  }

  return (
    <div className="auth-card max-w-xl bg-card/50 shadow-lg backdrop-blur-md">
      <ResetLinkStatusCard
        tokenStatus="invalid"
        forgotPasswordHref={forgotPasswordHref}
        showSignIn
        signInHref={signInHref}
      />
    </div>
  );
}
