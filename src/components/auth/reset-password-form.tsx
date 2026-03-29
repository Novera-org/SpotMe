"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  resetPasswordAction,
  type ResetPasswordActionState,
} from "@/actions/auth";
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
      <>
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground font-serif">
          Reset link expired
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          That password reset link has expired. Request a fresh one to keep going.
        </p>
        <Link
          href={forgotPasswordHref}
          className="inline-flex w-full items-center justify-center border border-border px-4 py-2 font-semibold"
        >
          Request a new reset link
        </Link>
      </>
    );
  }

  if (state?.tokenStatus === "invalid") {
    return (
      <>
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
      </>
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
