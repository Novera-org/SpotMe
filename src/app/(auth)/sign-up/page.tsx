"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/actions/auth";
import PasswordInput from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState<
    AuthActionState | null,
    FormData
  >(signUpAction, null);

  return (
    <div className="auth-card shadow-lg bg-card/50 backdrop-blur-md">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1 tracking-tight">Create Account</h1>
      <p className="text-muted-foreground text-sm mb-6">Get started by setting up your profile.</p>

      <form action={formAction} className="auth-form">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Your name"
          />
        </div>

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
            autoComplete="new-password"
            maxLength={128}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">
            Confirm Password
          </Label>
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

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating account..." : "Sign Up"}
        </Button>
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
