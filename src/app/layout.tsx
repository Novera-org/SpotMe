import { GuestMigrationHandler } from "@/components/shared/guest-migration-handler";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SpotMe — Find Your Event Photos in Seconds",
    template: "%s | SpotMe",
  },
  description:
    "Upload a selfie and AI finds your photos across hundreds of event images. No scrolling, no tagging, no signup required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceMono.variable} font-sans antialiased bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <GuestMigrationHandler />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
