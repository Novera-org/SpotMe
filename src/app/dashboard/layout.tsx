import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import SignOutButton from "@/components/shared/sign-out-button";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdmin();

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <h1 className="dashboard-brand">SpotMe</h1>
          <div className="dashboard-header-right">
            <Link
              href="/settings"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
            <span className="dashboard-user-email">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
