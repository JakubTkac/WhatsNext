import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { RouteTransitionIndicator } from "@/components/ui/route-transition-indicator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WhatsNext — Discover Upcoming Movies",
    template: "%s | WhatsNext",
  },
  description:
    "Discover upcoming movies, save your watchlist, and explore community reviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        <div className="relative isolate flex flex-1 flex-col">
          {children}
          <Suspense fallback={null}>
            <ActionFeedback />
          </Suspense>
          <Suspense fallback={null}>
            <RouteTransitionIndicator />
          </Suspense>
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
