import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-4 border-[2px]",
  md: "size-5 border-[2.5px]",
  lg: "size-8 border-[3px]",
} as const;

interface SpinnerProps {
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-muted-foreground/25 border-t-primary animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}
