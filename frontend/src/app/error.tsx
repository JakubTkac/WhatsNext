"use client";

import { PageErrorState } from "@/components/ui/page-error-state";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="This page is unavailable"
      description="Something interrupted the page while it was loading. Try again or return to the homepage."
      onRetry={reset}
    />
  );
}
