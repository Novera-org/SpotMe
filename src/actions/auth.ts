"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isEmailNotVerifiedError } from "@/lib/auth/error-messages";
import { checkVerificationEmailRateLimit } from "@/lib/auth/verification-rate-limit";
import {
  normalizeAuthCallbackUrl,
  setVerifyState,
} from "@/lib/auth/verify-state";
import { isAuthEmailSendingEnabled } from "@/lib/email";
import { processLogger } from "@/lib/logger";
import {
  forgotPasswordRequestSchema,
  signInSchema,
  signUpSchema,
  verificationEmailRequestSchema,
} from "@/lib/validations/auth";

export interface AuthActionState {
  error: string | null;
  email?: string;
  callbackUrl?: string;
  requiresEmailVerification?: boolean;
}

export interface VerificationEmailActionState {
  error: string | null;
  success: string | null;
}

export interface ForgotPasswordActionState {
  error: string | null;
  success: string | null;
}

const RESET_PASSWORD_PATH = "/reset-password";

function buildResetPasswordRedirect(callbackUrl: string) {
  const params = new URLSearchParams({
    callbackUrl,
  });

  return `${RESET_PASSWORD_PATH}?${params.toString()}`;
}

export async function signInAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const callbackUrl = normalizeAuthCallbackUrl(
    formData.get("callbackUrl")?.toString(),
  );

  let session;
  try {
    session = await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (isEmailNotVerifiedError(error)) {
      try {
        await setVerifyState({
          email: parsed.data.email,
          callbackUrl,
        });
      } catch (persistError) {
        processLogger.error(
          "[signInAction] Failed to persist verification state:",
          persistError,
        );
      }

      return {
        error: null,
        email: parsed.data.email,
        callbackUrl,
        requiresEmailVerification: true,
      };
    }

    processLogger.error("[signInAction] Sign-in failed:", error);
    return { error: "Invalid email or password" };
  }

  const defaultRedirect = session?.user?.role === "admin" ? "/dashboard" : "/account";
  const redirectTarget =
    callbackUrl === "/account" ? defaultRedirect : callbackUrl;

  redirect(redirectTarget);
}

export async function signUpAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isAuthEmailSendingEnabled()) {
    return {
      error:
        "Account verification email delivery is not configured. Please try again later.",
    };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const callbackUrl = normalizeAuthCallbackUrl(
    formData.get("callbackUrl")?.toString(),
  );

  try {
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: callbackUrl,
      },
      headers: await headers(),
    });
  } catch (error: unknown) {
    processLogger.error("[signUpAction] Sign-up failed:", error);

    const message =
      error instanceof Error && error.message?.includes("unique")
        ? "An account with this email already exists"
        : "Failed to create account, please try again";
    return { error: message };
  }

  await setVerifyState({
    email: parsed.data.email,
    callbackUrl,
  });

  redirect("/verify-email");
}

export async function sendVerificationEmailAction(
  _prevState: VerificationEmailActionState | null,
  formData: FormData,
): Promise<VerificationEmailActionState> {
  if (!isAuthEmailSendingEnabled()) {
    return {
      error:
        "Verification email delivery is not configured. Add SMTP settings before testing this flow.",
      success: null,
    };
  }

  const parsed = verificationEmailRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: null };
  }

  try {
    const requestHeaders = await headers();
    const allowed = checkVerificationEmailRateLimit(
      parsed.data.email,
      requestHeaders,
    );

    if (!allowed) {
      return {
        error: "Too many verification email requests. Please wait and try again.",
        success: null,
      };
    }

    const callbackUrl = normalizeAuthCallbackUrl(
      formData.get("callbackUrl")?.toString(),
    );

    await setVerifyState({
      email: parsed.data.email,
      callbackUrl,
    });

    await auth.api.sendVerificationEmail({
      body: {
        email: parsed.data.email,
        callbackURL: callbackUrl,
      },
      headers: requestHeaders,
    });
  } catch (error) {
    processLogger.error(
      "[sendVerificationEmailAction] Failed to send verification email:",
      error,
    );
    return {
      error: "We couldn't send a verification email right now. Please try again.",
      success: null,
    };
  }

  return {
    error: null,
    success:
      "If that email belongs to an unverified account, a fresh verification link is on the way.",
  };
}

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordActionState | null,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  if (!isAuthEmailSendingEnabled()) {
    return {
      error:
        "Password reset email delivery is not configured. Add SMTP settings before testing this flow.",
      success: null,
    };
  }

  const parsed = forgotPasswordRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: null };
  }

  const callbackUrl = normalizeAuthCallbackUrl(
    formData.get("callbackUrl")?.toString(),
  );

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: parsed.data.email,
        redirectTo: buildResetPasswordRedirect(callbackUrl),
      },
      headers: await headers(),
    });
  } catch (error) {
    processLogger.error(
      "[requestPasswordResetAction] Failed to request password reset:",
      error,
    );
    return {
      error: "We couldn't send a password reset email right now. Please try again.",
      success: null,
    };
  }

  return {
    error: null,
    success:
      "If an account with that email exists, a password reset link is on the way.",
  };
}

export async function signOutAction(): Promise<void> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch {
    // Ignore sign-out errors
  }

  redirect("/");
}
