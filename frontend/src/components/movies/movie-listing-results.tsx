"use client";

import type { ReactNode } from "react";
import { MovieResultsSkeleton } from "@/components/movies/movie-listing-skeleton";
import {
  getListingPageItemCount,
  readListingDestinationPage,
  useListingNavigation,
} from "@/components/ui/listing-navigation";
import { Pagination } from "@/components/ui/pagination";

type MovieListingResultsProps = {
  children: ReactNode;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageSize: number;
  pathname: string;
  query: Record<string, string | number | undefined>;
};

export function MovieListingResults({
  children,
  currentPage,
  totalItems,
  totalPages,
  pageSize,
  pathname,
  query,
}: MovieListingResultsProps) {
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
          {totalItems} {totalItems === 1 ? "movie" : "movies"}
        </p>
        <p className="text-xs text-subtle" aria-live="polite">
          Page {displayedPage}
          {totalPages > 0 ? ` of ${totalPages}` : ""}
        </p>
      </div>

      {pending ? (
        <MovieResultsSkeleton itemCount={skeletonItemCount} />
      ) : (
        children
      )}

      <Pagination
        currentPage={displayedPage}
        totalPages={totalPages}
        pathname={pathname}
        query={query}
        pending={pending}
        onNavigate={navigation?.navigate}
      />
    </div>
  );
}
