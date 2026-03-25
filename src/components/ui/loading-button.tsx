"use client";

import { Button } from "./button";
import { Spinner } from "./spinner";
import { type VariantProps } from "./button-variants";
import { buttonVariants } from "./button-variants";
import { cn } from "@/lib/utils";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

interface LoadingButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || isLoading}
      className={cn("relative", className)}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <Spinner
          size="sm"
          className="border-current/25 border-t-current"
        />
      )}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}
