"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";

export interface AuthActionState {
  error: string | null;
}

export async function signInAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Server-side validation with Zod
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });
  } catch {
    return { error: "Invalid email or password" };
  }

  // Read callbackUrl from form hidden input, default to /dashboard
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";
  redirect(callbackUrl);
}

export async function signUpAction(
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
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

  try {
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });
  } catch {
    return { error: "An account with this email already exists" };
  }

  redirect("/dashboard");
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
