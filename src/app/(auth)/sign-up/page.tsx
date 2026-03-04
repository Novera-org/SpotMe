"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/actions/auth";
import PasswordInput from "@/components/shared/password-input";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState<
    AuthActionState | null,
    FormData
  >(signUpAction, null);

  return (
    <div className="auth-card">
      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">Get started by creating a new account.</p>

      <form action={formAction} className="auth-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            className="form-input"
            placeholder="Your name"
          />
        </div>

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
            autoComplete="new-password"
            maxLength={128}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
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

        <button type="submit" disabled={isPending} className="form-button">
          {isPending ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link href="/sign-in" className="auth-link">
          Sign In
        </Link>
      </p>
    </div>
  );
}
