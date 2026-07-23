"use client";

import type { ReactNode } from "react";
import { ReviewResultsSkeleton } from "@/components/reviews/reviews-page-skeleton";
import {
  getListingPageItemCount,
  readListingDestinationPage,
  useListingNavigation,
} from "@/components/ui/listing-navigation";
import { Pagination } from "@/components/ui/pagination";

type ReviewListingResultsProps = {
  children: ReactNode;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageSize: number;
  query: Record<string, string | number | undefined>;
};

export function ReviewListingResults({
  children,
  currentPage,
  totalItems,
  totalPages,
  pageSize,
  query,
}: ReviewListingResultsProps) {
  const navigation = useListingNavigation();
  const pending = navigation?.pending === true;
  const displayedPage = pending
    ? readListingDestinationPage(navigation?.destination ?? null)
    : currentPage;
  const skeletonItemCount =
    getListingPageItemCount(totalItems, pageSize, displayedPage) ||
    pageSize;

  return (
    <div aria-busy={pending}>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {totalItems} {totalItems === 1 ? "review" : "reviews"}
        </p>
        <p className="text-xs text-subtle" aria-live="polite">
          Page {displayedPage}
          {totalPages > 0 ? ` of ${totalPages}` : ""}
        </p>
      </div>

      {pending ? (
        <ReviewResultsSkeleton itemCount={skeletonItemCount} />
      ) : (
        children
      )}

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
