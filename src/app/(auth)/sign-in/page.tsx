"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInAction, type AuthActionState } from "@/actions/auth";
import PasswordInput from "@/components/shared/password-input";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [state, formAction, isPending] = useActionState<
    AuthActionState | null,
    FormData
  >(signInAction, null);

  return (
    <div className="auth-card">
      <h1 className="auth-title">Sign In</h1>
      <p className="auth-subtitle">Welcome back — sign in to your account.</p>

      <form action={formAction} className="auth-form">
        <input name="callbackUrl" type="hidden" value={callbackUrl} />

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="form-input"
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
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

        <button type="submit" disabled={isPending} className="form-button">
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="auth-link">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
