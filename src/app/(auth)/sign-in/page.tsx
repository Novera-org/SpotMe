"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInAction, type AuthActionState } from "@/actions/auth";
import { VerificationResendForm } from "@/components/auth/verification-resend-form";
import PasswordInput from "@/components/shared/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const resetStatus = searchParams.get("reset");
  const signUpHref = `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const forgotPasswordHref = `/forgot-password?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const [state, formAction, isPending] = useActionState<
    AuthActionState | null,
    FormData
  >(signInAction, null);
  const verificationEmail = state?.requiresEmailVerification
    ? state.email ?? ""
    : "";
  const verificationCallbackUrl = state?.callbackUrl ?? callbackUrl;

  return (
    <div className="auth-card shadow-lg bg-card/50 backdrop-blur-md">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground font-serif">
        Sign In
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Welcome back - log in to your account.
      </p>

      {resetStatus === "success" && (
        <p className="mb-4 text-sm text-muted-foreground" role="status">
          Your password has been reset. You can sign in with your new password now.
        </p>
      )}

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="password">Password</Label>
            <Link href={forgotPasswordHref} className="text-sm auth-link">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
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
          loadingText="Signing in..."
          className="w-full"
        >
          Sign In
        </LoadingButton>
      </form>

      {state?.requiresEmailVerification && (
        <div
          className="mt-4 space-y-4 rounded-xl border border-border bg-muted/20 p-4"
          role="status"
        >
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              Verify your email before signing in
            </h2>
            <p className="text-sm text-muted-foreground">
              {verificationEmail
                ? `Your account for ${verificationEmail} still needs email verification. Open the link we sent you, or request a fresh one below.`
                : "Your account still needs email verification. Open the link we sent you, or request a fresh one below."}
            </p>
          </div>
          <VerificationResendForm
            key={`${verificationEmail}:${verificationCallbackUrl}`}
            callbackUrl={verificationCallbackUrl}
            initialEmail={verificationEmail}
          />
        </div>
      )}

      <p className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href={signUpHref} className="auth-link">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
