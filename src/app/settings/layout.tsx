import Link from "next/link";
import { getServerSession } from "@/lib/auth/helpers";
import { AdminHeader } from "@/components/shared/admin-header";
import SignOutButton from "@/components/shared/sign-out-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SettingsNav, SettingsTabs } from "@/components/settings/settings-nav";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getUserDisplayLabel } from "@/lib/utils";

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
  const userLabel = getUserDisplayLabel(session.user.name, session.user.email);

  return (
    <div className="dashboard-layout">
      <AdminHeader
        userLabel={userLabel}
        actions={
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton
              variant="ghost"
              size="sm"
              className="h-auto border-0 bg-transparent p-0 text-sm font-normal normal-case tracking-normal text-muted-foreground hover:bg-transparent hover:text-destructive active:translate-y-0"
            />
          </div>
        }
      />

      <main className="dashboard-main space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

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
