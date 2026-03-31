import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import { AdminHeader } from "@/components/shared/admin-header";
import SignOutButton from "@/components/shared/sign-out-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn, getUserDisplayLabel } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdmin();
  const userLabel = getUserDisplayLabel(session.user.name, session.user.email);

  return (
    <div className="dashboard-layout">
      <AdminHeader
        userLabel={userLabel}
        actions={
          <div className="flex items-center gap-3 mr-2">
            <ThemeToggle />
            <SignOutButton
              variant="ghost"
              size="sm"
              className="h-auto border-0 bg-transparent p-0 text-sm font-normal normal-case tracking-normal text-muted-foreground hover:bg-transparent hover:text-destructive active:translate-y-0"
            />
            <Link
              href="/settings"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "relative no-underline"
              )}
            >
              Settings
            </Link>
          </div>
        }
      />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
