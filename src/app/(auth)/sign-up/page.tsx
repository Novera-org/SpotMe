"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/actions/auth";
import PasswordInput from "@/components/shared/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const [state, formAction, isPending] = useActionState<
    AuthActionState | null,
    FormData
  >(signUpAction, null);

  return (
    <div className="auth-card shadow-lg bg-card/50 backdrop-blur-md">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-1 tracking-tight">Create Account</h1>
      <p className="text-muted-foreground text-sm mb-6">Get started by setting up your profile.</p>

      <form action={formAction} className="auth-form">
        <input name="callbackUrl" type="hidden" value={callbackUrl} />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">
            I&apos;m signing up as
          </legend>

          <label className="flex cursor-pointer items-start gap-3 border border-border p-4 transition-colors hover:bg-muted/10">
            <input
              type="radio"
              name="audience"
              value="user"
              className="mt-1"
              required
            />
            <span className="space-y-1">
              <span className="block text-sm font-semibold text-foreground">
                Normal User
              </span>
              <span className="block text-sm text-muted-foreground">
                Search private albums, save favorites, and manage your own account.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-border p-4 transition-colors hover:bg-muted/10">
            <input
              type="radio"
              name="audience"
              value="event-holder"
              className="mt-1"
              required
            />
            <span className="space-y-1">
              <span className="block text-sm font-semibold text-foreground">
                Event Holder
              </span>
              <span className="block text-sm text-muted-foreground">
                Create albums, upload images, manage settings, and access the dashboard.
              </span>
            </span>
          </label>
        </fieldset>

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

        <LoadingButton type="submit" isLoading={isPending} loadingText="Creating account…" className="w-full">
          Sign Up
        </LoadingButton>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link href={signInHref} className="auth-link">
          Sign In
        </Link>
      </p>
    </div>
  );
}
