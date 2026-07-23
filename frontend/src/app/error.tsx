"use client";

import Link from "next/link";
import { PageErrorState } from "@/components/ui/page-error-state";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex min-h-20 w-full max-w-[92rem] items-center px-4 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="text-2xl font-bold tracking-[-0.05em] text-foreground"
          >
            Whats<span className="text-primary">Next</span>
          </Link>
        </div>
      </header>
      <PageErrorState
        title="This page is unavailable"
        description="Something interrupted the page while it was loading. Try again or return to the homepage."
        onRetry={reset}
      />
    </div>
  );
}
