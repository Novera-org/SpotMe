"use client";

import { signOutAction } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

function SignOutButtonInner() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? "Signing out..." : "Sign Out"}
    </Button>
  );
}

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SignOutButtonInner />
    </form>
  );
}
