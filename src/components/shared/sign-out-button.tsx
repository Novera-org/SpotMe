"use client";

import { signOutAction } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import { LoadingButton } from "@/components/ui/loading-button";

function SignOutButtonInner() {
  const { pending } = useFormStatus();
  return (
    <LoadingButton type="submit" variant="outline" size="sm" isLoading={pending} loadingText="Signing out…">
      Sign Out
    </LoadingButton>
  );
}

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SignOutButtonInner />
    </form>
  );
}
