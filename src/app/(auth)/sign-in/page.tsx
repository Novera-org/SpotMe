"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInAction, type AuthActionState } from "@/actions/auth";
import PasswordInput from "@/components/shared/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const signUpHref = `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const [state, formAction, isPending] = useActionState<
    AuthActionState | null,
    FormData
  >(signInAction, null);

  return (
    <div className="auth-card shadow-lg bg-card/50 backdrop-blur-md">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1 tracking-tight">Sign In</h1>
      <p className="text-muted-foreground text-sm mb-6">Welcome back — log in to your account.</p>

      <form action={formAction} className="auth-form">
        <input name="callbackUrl" type="hidden" value={callbackUrl} />

        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email
          </Label>
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
          <Label htmlFor="password">
            Password
          </Label>
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

        <LoadingButton type="submit" isLoading={isPending} loadingText="Signing in…" className="w-full">
          Sign In
        </LoadingButton>
      </form>

      <p className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href={signUpHref} className="auth-link">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
