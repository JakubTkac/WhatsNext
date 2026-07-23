"use client";

import type { ReactNode } from "react";
import { ReviewResultsSkeleton } from "@/components/reviews/reviews-page-skeleton";
import {
  readListingDestinationPage,
  useListingNavigation,
} from "@/components/ui/listing-navigation";
import { Pagination } from "@/components/ui/pagination";

type ReviewListingResultsProps = {
  children: ReactNode;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  query: Record<string, string | number | undefined>;
};

export function ReviewListingResults({
  children,
  currentPage,
  totalItems,
  totalPages,
  query,
}: ReviewListingResultsProps) {
  const navigation = useListingNavigation();
  const pending = navigation?.pending === true;
  const displayedPage = pending
    ? readListingDestinationPage(navigation?.destination ?? null)
    : currentPage;

  return (
    <div aria-busy={pending}>
      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {totalItems} {totalItems === 1 ? "review" : "reviews"}
        </p>
        <p className="text-sm text-subtle" aria-live="polite">
          Page {displayedPage}
          {totalPages > 0 ? ` of ${totalPages}` : ""}
        </p>
      </div>

      {pending ? <ReviewResultsSkeleton /> : children}

      <Pagination
        currentPage={displayedPage}
        totalPages={totalPages}
        pathname="/reviews"
        query={query}
        pending={pending}
        onNavigate={navigation?.navigate}
      />
    </div>
  );
}
