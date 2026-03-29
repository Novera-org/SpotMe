"use client";

import { useActionState } from "react";
import {
  sendVerificationEmailAction,
  type VerificationEmailActionState,
} from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";

interface VerificationResendFormProps {
  callbackUrl: string;
  initialEmail?: string | null;
}

export function VerificationResendForm({
  callbackUrl,
  initialEmail,
}: VerificationResendFormProps) {
  const [state, formAction, isPending] = useActionState<
    VerificationEmailActionState | null,
    FormData
  >(sendVerificationEmailAction, null);

  return (
    <form action={formAction} className="auth-form border border-border p-4">
      <input name="callbackUrl" type="hidden" value={callbackUrl} />

      <div className="space-y-1.5">
        <Label htmlFor="verification-email">Email</Label>
        <Input
          id="verification-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={initialEmail ?? ""}
          placeholder="you@example.com"
          required
        />
      </div>

      {state?.error && (
        <div className="form-error" role="alert">
          {state.error}
        </div>
      )}

      {state?.success && (
        <p className="text-sm text-muted-foreground" role="status">
          {state.success}
        </p>
      )}

      <LoadingButton
        type="submit"
        isLoading={isPending}
        loadingText="Sending..."
        className="w-full"
      >
        Resend verification email
      </LoadingButton>
    </form>
  );
}
