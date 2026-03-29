"use client";

import { useActionState } from "react";
import {
  resetPasswordAction,
  type ResetPasswordActionState,
} from "@/actions/auth";
import { ResetLinkStatusCard } from "@/components/auth/reset-link-status-card";
import PasswordInput from "@/components/shared/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Label } from "@/components/ui/label";

interface ResetPasswordFormProps {
  token: string;
  callbackUrl: string;
  forgotPasswordHref: string;
}

export function ResetPasswordForm({
  token,
  callbackUrl,
  forgotPasswordHref,
}: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState<
    ResetPasswordActionState | null,
    FormData
  >(resetPasswordAction, null);

  if (state?.tokenStatus === "expired") {
    return (
      <ResetLinkStatusCard
        tokenStatus="expired"
        forgotPasswordHref={forgotPasswordHref}
      />
    );
  }

  if (state?.tokenStatus === "invalid") {
    return (
      <ResetLinkStatusCard
        tokenStatus="invalid"
        forgotPasswordHref={forgotPasswordHref}
      />
    );
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground font-serif">
        Reset your password
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Choose a new password for your account.
      </p>

      <form action={formAction} className="auth-form">
        <input name="token" type="hidden" value={token} />
        <input name="callbackUrl" type="hidden" value={callbackUrl} />

        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New Password</Label>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            autoComplete="new-password"
            maxLength={128}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            maxLength={128}
          />
        </div>

        {state?.error && (
          <div className="form-error" role="alert">
            {state.error}
          </div>
        )}

        <LoadingButton
          type="submit"
          isLoading={isPending}
          loadingText="Resetting password..."
          className="w-full"
        >
          Save new password
        </LoadingButton>
      </form>
    </>
  );
}
