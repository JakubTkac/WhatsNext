import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MovieFilters } from "@/components/movies/movie-filters";
import { MovieGridCard } from "@/components/movies/movie-grid-card";
import { MovieListingResults } from "@/components/movies/movie-listing-results";
import { MovieListingPageSkeleton } from "@/components/movies/movie-listing-skeleton";
import { MovieWatchlistAction } from "@/components/movies/movie-watchlist-action";
import { PageErrorState } from "@/components/ui/page-error-state";
import { SectionEmptyState } from "@/components/ui/section-state";
import type { MoviesQuery } from "@/lib/api";
import {
  createMovieFiltersKey,
  createMovieListingHref,
  createMoviePaginationQuery,
  hasActiveMovieFilters,
  parseMoviesQuery,
} from "@/lib/movie-list-query";
import { createAuthHref } from "@/lib/return-to";
import { getMovieWatchlist } from "@/lib/watchlist";

type WatchlistPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WatchlistPage({
  searchParams,
}: WatchlistPageProps) {
  const query = parseMoviesQuery(await searchParams);

  return (
    <Suspense fallback={<MovieListingPageSkeleton />}>
      <WatchlistListing query={query} />
    </Suspense>
  );
}

async function WatchlistListing({ query }: { query: MoviesQuery }) {
  const connection = await getMovieWatchlist(query);
  const returnTo = createMovieListingHref("/watchlist", query);

  if (connection.status === "unauthenticated") {
    redirect(createAuthHref("/login", returnTo));
  }

  if (connection.status === "unavailable") {
    return (
      <PageErrorState
        title="Watchlist unavailable"
        description="We could not load your saved movies. Please try again."
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">
          Your watchlist
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Every movie you saved, in one place.
        </p>
      </div>

      <MovieFilters
        key={createMovieFiltersKey(query)}
        query={query}
        genres={connection.genres}
        pathname="/watchlist"
      />

      <MovieListingResults
        currentPage={connection.meta.page}
        totalPages={connection.meta.totalPages}
        pathname="/watchlist"
        query={createMoviePaginationQuery(query)}
      >
        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {connection.meta.totalItems}{" "}
            {connection.meta.totalItems === 1 ? "movie" : "movies"}
          </p>
          <p className="text-sm text-subtle">
            Page {connection.meta.page}
            {connection.meta.totalPages > 0
              ? ` of ${connection.meta.totalPages}`
              : ""}
          </p>
        </div>

        {connection.items.length === 0 ? (
          <div className="mt-6">
            <SectionEmptyState
              title={
                hasActiveMovieFilters(query)
                  ? "No saved movies match these filters"
                  : "Your watchlist is empty"
              }
              description={
                hasActiveMovieFilters(query)
                  ? "Adjust the title, genre, or release filter and try again."
                  : "Browse the movie catalogue and save anything you want to watch later."
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {connection.items.map((item) => (
              <MovieGridCard key={item.id} movie={item.movie}>
                <MovieWatchlistAction
                  state="available"
                  movieSlug={item.movie.slug}
                  returnTo={returnTo}
                  initiallySaved
                />
              </MovieGridCard>
            ))}
          </div>
        )}
      </MovieListingResults>
    </main>
  );
}
