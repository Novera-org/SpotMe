import Link from "next/link";
import { getServerSession } from "@/lib/auth/helpers";
import SignOutButton from "@/components/shared/sign-out-button";
import { SettingsNav, SettingsTabs } from "@/components/settings/settings-nav";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="flex items-center gap-4">
            <Link href="/" className="dashboard-brand">
              SpotMe
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </div>
          <div className="dashboard-header-right">
            <span className="dashboard-user-email">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="dashboard-main space-y-6">
        <div>
          <h1 className="dashboard-page-title">Settings</h1>
          <p className="dashboard-page-desc">Manage your account and album preferences.</p>
        </div>

        <SettingsTabs />

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <SettingsNav />
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}
