"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SETTINGS_SECTIONS = [
  { href: "/settings/account", label: "Account", description: "Personal info and security" },
  { href: "/settings/albums", label: "Albums", description: "Album management" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block border border-border bg-card p-4 h-fit">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Settings
      </h2>
      <ul className="mt-3 space-y-2">
        {SETTINGS_SECTIONS.map((section) => {
          const isActive = pathname.startsWith(section.href);
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                className={cn(
                  "block border px-3 py-2 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted/30"
                )}
              >
                <p className="text-sm font-semibold">{section.label}</p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {section.description}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden border border-border p-1 bg-card">
      <ul className="grid grid-cols-2 gap-1">
        {SETTINGS_SECTIONS.map((section) => {
          const isActive = pathname.startsWith(section.href);
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                className={cn(
                  "block px-3 py-2 text-sm border transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-muted/40"
                )}
              >
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
