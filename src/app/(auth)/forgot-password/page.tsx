"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  requestPasswordResetAction,
  type ForgotPasswordActionState,
} from "@/actions/auth";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const [state, formAction, isPending] = useActionState<
    ForgotPasswordActionState | null,
    FormData
  >(requestPasswordResetAction, null);

  return (
    <div className="auth-card max-w-xl bg-card/50 shadow-lg backdrop-blur-md">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground font-serif">
        Forgot your password?
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Enter your email address and we&apos;ll send you a reset link if an
        account exists for it.
      </p>

      <form action={formAction} className="auth-form">
        <input name="callbackUrl" type="hidden" value={callbackUrl} />

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
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
          loadingText="Sending reset link..."
          className="w-full"
        >
          Send reset link
        </LoadingButton>
      </form>

      <p className="auth-footer">
        Remembered your password?{" "}
        <Link href={signInHref} className="auth-link">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
