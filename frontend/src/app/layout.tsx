import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { RouteTransitionIndicator } from "@/components/ui/route-transition-indicator";
import {
  createPublicPageMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  siteUrl,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultMetadata = createPublicPageMetadata({
  title: "Discover Upcoming Movies",
  description: SITE_DESCRIPTION,
  path: "/",
});

export const metadata: Metadata = {
  ...defaultMetadata,
  metadataBase: siteUrl,
  applicationName: SITE_NAME,
  title: {
    default: "WhatsNext — Discover Upcoming Movies",
    template: "%s | WhatsNext",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "upcoming movies",
    "movie release dates",
    "movie watchlist",
    "movie reviews",
  ],
  authors: [{ name: SITE_NAME, url: "/" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "entertainment",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
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
