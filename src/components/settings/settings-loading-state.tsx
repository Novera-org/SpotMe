import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SettingsLoadingSection = "generic" | "account" | "albums";

interface SettingsLoadingStateProps {
  section?: SettingsLoadingSection;
  showShell?: boolean;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={cn("rounded-md bg-muted/10 animate-pulse", className)} />;
}

function SkeletonTextGroup({
  titleWidth,
  descriptionWidth,
}: {
  titleWidth: string;
  descriptionWidth: string;
}) {
  return (
    <div className="space-y-2">
      <SkeletonBlock className={cn("h-5", titleWidth)} />
      <SkeletonBlock className={cn("h-4 max-w-full", descriptionWidth)} />
    </div>
  );
}

function SkeletonField({
  labelWidth = "w-24",
  inputHeight = "h-10",
}: {
  labelWidth?: string;
  inputHeight?: string;
}) {
  return (
    <div className="space-y-1.5">
      <SkeletonBlock className={cn("h-4", labelWidth)} />
      <SkeletonBlock className={cn("w-full", inputHeight)} />
    </div>
  );
}

function SkeletonSection({
  children,
  animationDelay,
}: {
  children: ReactNode;
  animationDelay?: string;
}) {
  return (
    <section
      className="space-y-5 border border-border bg-card p-5 animate-fade-up"
      style={animationDelay ? { animationDelay } : undefined}
    >
      {children}
    </section>
  );
}

function SettingsSidebarSkeleton() {
  return (
    <aside className="hidden h-fit border border-border bg-card p-4 md:block">
      <SkeletonBlock className="h-4 w-20" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 border border-border px-3 py-2"
          >
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-3 w-32" />
          </div>
        ))}
      </div>
    </aside>
  );
}

function SettingsTabsSkeleton() {
  return (
    <nav className="border border-border bg-card p-1 md:hidden">
      <ul className="grid grid-cols-2 gap-1">
        {Array.from({ length: 2 }).map((_, index) => (
          <li key={index}>
            <SkeletonBlock className="h-10 w-full rounded-none" />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function GenericSettingsContentSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <SkeletonSection
          key={index}
          animationDelay={`${index * 0.08}s`}
        >
          <SkeletonTextGroup titleWidth="w-40" descriptionWidth="w-72" />

          <div className="space-y-3">
            <SkeletonField />
            <SkeletonField labelWidth="w-28" />
          </div>

          <SkeletonBlock className="h-10 w-32" />
        </SkeletonSection>
      ))}
    </div>
  );
}

function AccountSettingsContentSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonSection>
        <SkeletonTextGroup titleWidth="w-28" descriptionWidth="w-52" />

        <div className="max-w-xl space-y-4">
          <SkeletonField labelWidth="w-14" />
          <SkeletonField />
          <SkeletonBlock className="h-10 w-32" />
        </div>
      </SkeletonSection>

      <SkeletonSection animationDelay="0.08s">
        <SkeletonTextGroup titleWidth="w-20" descriptionWidth="w-64" />

        <div className="max-w-xl space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonField key={index} labelWidth="w-32" />
          ))}
          <SkeletonBlock className="h-10 w-36" />
        </div>
      </SkeletonSection>

      <SkeletonSection animationDelay="0.16s">
        <SkeletonTextGroup titleWidth="w-32" descriptionWidth="w-60" />

        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="flex flex-col gap-4 border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-3 w-40" />
                <SkeletonBlock className="h-3 w-36" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-7 w-16" />
                <SkeletonBlock className="h-9 w-20" />
              </div>
            </li>
          ))}
        </ul>
      </SkeletonSection>
    </div>
  );
}

function AlbumSettingsContentSkeleton() {
  return (
    <section className="space-y-4">
      <header>
        <SkeletonTextGroup titleWidth="w-40" descriptionWidth="w-72" />
      </header>

      <ul className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <li
            key={index}
            className="space-y-4 border border-border bg-card p-4 animate-fade-up"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-14 w-14 rounded-none" />

                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-10 w-10" />
                <SkeletonBlock className="h-10 w-10" />
              </div>
            </div>

            <div className="space-y-4">
              <SkeletonField labelWidth="w-20" />
              <SkeletonField labelWidth="w-20" />

              <div className="flex flex-wrap items-center gap-2">
                <SkeletonBlock className="h-10 w-28" />
                <SkeletonBlock className="h-10 w-24" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SettingsContentSkeleton({
  section,
}: {
  section: SettingsLoadingSection;
}) {
  if (section === "account") {
    return <AccountSettingsContentSkeleton />;
  }

  if (section === "albums") {
    return <AlbumSettingsContentSkeleton />;
  }

  return <GenericSettingsContentSkeleton />;
}

export function SettingsLoadingState({
  section = "generic",
  showShell = false,
}: SettingsLoadingStateProps) {
  const content = <SettingsContentSkeleton section={section} />;

  if (!showShell) {
    return content;
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <SkeletonBlock className="h-7 w-24" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-4 w-40 hidden sm:block" />
            <SkeletonBlock className="h-9 w-24" />
          </div>
        </div>
      </header>

      <main className="dashboard-main space-y-6">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-36" />
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-28" />
            <SkeletonBlock className="h-4 w-72 max-w-full" />
          </div>
        </div>

        <SettingsTabsSkeleton />

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <SettingsSidebarSkeleton />
          <div className="space-y-8">
            {content}

            <div className="flex items-center justify-center gap-3 py-4">
              <Spinner size="md" />
              <span className="text-sm text-muted-foreground/70">
                Loading your settings...
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
