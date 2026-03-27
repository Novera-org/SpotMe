"use client";

import { signOutAction } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import { LoadingButton } from "@/components/ui/loading-button";
import { type VariantProps } from "@/components/ui/button-variants";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface SignOutButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
}

function SignOutButtonInner({
  variant = "outline",
  size = "sm",
  className,
}: SignOutButtonProps) {
  const { pending } = useFormStatus();

  return (
    <LoadingButton
      type="submit"
      variant={variant}
      size={size}
      className={cn(className)}
      isLoading={pending}
      loadingText="Signing out..."
    >
      Sign-Out
    </LoadingButton>
  );
}

export default function SignOutButton(props: SignOutButtonProps) {
  return (
    <form action={signOutAction}>
      <SignOutButtonInner {...props} />
    </form>
  );
}
