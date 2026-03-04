"use client";

import { signOutAction } from "@/actions/auth";
import { useFormStatus } from "react-dom";

function SignOutButtonInner() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="sign-out-button">
      {pending ? "Signing out..." : "Sign Out"}
    </button>
  );
}

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SignOutButtonInner />
    </form>
  );
}
