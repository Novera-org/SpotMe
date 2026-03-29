import Link from "next/link";

interface ResetLinkStatusCardProps {
  tokenStatus: "expired" | "invalid";
  forgotPasswordHref: string;
  showSignIn?: boolean;
  signInHref?: string;
}

const copy = {
  expired: {
    title: "Reset link expired",
    message:
      "That password reset link has expired. Request a fresh one to continue.",
  },
  invalid: {
    title: "Reset link invalid",
    message:
      "That password reset link could not be used. Request a fresh one to try again.",
  },
} as const;

export function ResetLinkStatusCard({
  tokenStatus,
  forgotPasswordHref,
  showSignIn = false,
  signInHref,
}: ResetLinkStatusCardProps) {
  const content = copy[tokenStatus];

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground font-serif">
        {content.title}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">{content.message}</p>
      <Link
        href={forgotPasswordHref}
        className="inline-flex w-full items-center justify-center border border-border px-4 py-2 font-semibold"
      >
        Request a new reset link
      </Link>
      {showSignIn && signInHref ? (
        <p className="auth-footer">
          Return to{" "}
          <Link href={signInHref} className="auth-link">
            sign in
          </Link>
        </p>
      ) : null}
    </>
  );
}
