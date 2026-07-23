"use client";

import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useTransition,
} from "react";
import { MovieResultsSkeleton } from "@/components/movies/movie-listing-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { beginRouteTransition } from "@/components/ui/route-transition-indicator";

type MovieListingResultsProps = {
  children: ReactNode;
  currentPage: number;
  totalPages: number;
  pathname: string;
  query: Record<string, string | number | undefined>;
};

export function MovieListingResults({
  children,
  currentPage,
  totalPages,
  pathname,
  query,
}: MovieListingResultsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      beginRouteTransition(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  return (
    <div aria-busy={pending}>
      {pending ? <MovieResultsSkeleton /> : children}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pathname={pathname}
        query={query}
        pending={pending}
        onNavigate={navigate}
      />
    </div>
  );
}
