import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MovieFilters } from "@/components/movies/movie-filters";
import { MovieGridCard } from "@/components/movies/movie-grid-card";
import { MovieListingResults } from "@/components/movies/movie-listing-results";
import { MovieListingPageSkeleton } from "@/components/movies/movie-listing-skeleton";
import { RecentlyViewedMovies } from "@/components/movies/recently-viewed-movies";
import { MovieWatchlistAction } from "@/components/movies/movie-watchlist-action";
import { PageErrorState } from "@/components/ui/page-error-state";
import { SectionEmptyState } from "@/components/ui/section-state";
import { ListingNavigationProvider } from "@/components/ui/listing-navigation";
import type { MoviesQuery } from "@/lib/api";
import {
  createMovieFiltersKey,
  createMovieListingHref,
  createMoviePaginationQuery,
  hasActiveMovieFilters,
  parseMoviesQuery,
} from "@/lib/movie-list-query";
import { createAuthHref } from "@/lib/return-to";
import { createPrivatePageMetadata } from "@/lib/seo";
import { getMovieWatchlist } from "@/lib/watchlist";

export const metadata: Metadata = createPrivatePageMetadata({
  title: "Your Watchlist",
  description:
    "View and manage the movies saved to your personal WhatsNext watchlist.",
  path: "/watchlist",
});

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
    <main className="page-shell">
      <div className="max-w-3xl">
        <h1 className="page-title">
          Your watchlist
        </h1>
        <p className="page-lede">
          Every movie you saved, in one place.
        </p>
      </div>

      <ListingNavigationProvider>
        <MovieFilters
          key={createMovieFiltersKey(query)}
          query={query}
          genres={connection.genres}
          pathname="/watchlist"
        />

        <MovieListingResults
          currentPage={connection.meta.page}
          totalItems={connection.meta.totalItems}
          totalPages={connection.meta.totalPages}
          pageSize={connection.meta.limit}
          pathname="/watchlist"
          query={createMoviePaginationQuery(query)}
        >
          {connection.items.length === 0 ? (
            <div className="mt-3">
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
            <div className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
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
      </ListingNavigationProvider>

      <RecentlyViewedMovies className="mt-8" />
    </main>
  );
}
