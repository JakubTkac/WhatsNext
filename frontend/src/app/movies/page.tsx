import type { Metadata } from "next";
import { Suspense } from "react";
import { MovieFilters } from "@/components/movies/movie-filters";
import { MovieGridCard } from "@/components/movies/movie-grid-card";
import { MovieListingResults } from "@/components/movies/movie-listing-results";
import { MovieListingPageSkeleton } from "@/components/movies/movie-listing-skeleton";
import { RecentlyViewedMovies } from "@/components/movies/recently-viewed-movies";
import { MovieWatchlistAction } from "@/components/movies/movie-watchlist-action";
import { PageErrorState } from "@/components/ui/page-error-state";
import { SectionEmptyState } from "@/components/ui/section-state";
import { ListingNavigationProvider } from "@/components/ui/listing-navigation";
import {
  getMoviesPage,
  type MoviesQuery,
} from "@/lib/api";
import {
  createMovieFiltersKey,
  createMovieListingHref,
  createMoviePaginationQuery,
  parseMoviesQuery,
} from "@/lib/movie-list-query";
import { createPublicPageMetadata } from "@/lib/seo";
import { getMovieWatchlist } from "@/lib/watchlist";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Browse Movies",
  description:
    "Browse the complete WhatsNext movie catalogue by title, genre, release status, and release date.",
  path: "/movies",
});

type MoviesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MoviesPage({
  searchParams,
}: MoviesPageProps) {
  const query = parseMoviesQuery(await searchParams);

  return (
    <Suspense fallback={<MovieListingPageSkeleton />}>
      <MoviesListing query={query} />
    </Suspense>
  );
}

async function MoviesListing({ query }: { query: MoviesQuery }) {
  const [connection, watchlistConnection] = await Promise.all([
    getMoviesPage(query),
    getMovieWatchlist(),
  ]);

  if (!connection.online) {
    return (
      <PageErrorState
        title="Movie catalogue unavailable"
        description="We could not load the movie catalogue. Please try again."
      />
    );
  }

  const returnTo = createMovieListingHref("/movies", query);
  const savedMovieSlugs =
    watchlistConnection.status === "online"
      ? new Set(watchlistConnection.movieSlugs)
      : null;

  return (
    <main className="page-shell">
      <div className="max-w-3xl">
        <h1 className="page-title">
          Browse movies
        </h1>
        <p className="page-lede">
          Find out when your movie is coming out
        </p>
      </div>

      <ListingNavigationProvider>
        <MovieFilters
          key={createMovieFiltersKey(query)}
          query={query}
          genres={connection.genres}
          pathname="/movies"
        />

        <MovieListingResults
          currentPage={connection.meta.page}
          totalItems={connection.meta.totalItems}
          totalPages={connection.meta.totalPages}
          pageSize={connection.meta.limit}
          pathname="/movies"
          query={createMoviePaginationQuery(query)}
        >
          {connection.movies.length === 0 ? (
            <div className="mt-3">
              <SectionEmptyState
                title="No movies match these filters"
                description="Adjust the title, genre, or release filter and try again."
              />
            </div>
          ) : (
            <div className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {connection.movies.map((movie) => (
                <MovieGridCard key={movie.slug} movie={movie}>
                  {watchlistConnection.status === "online" ? (
                    <MovieWatchlistAction
                      state="available"
                      movieSlug={movie.slug}
                      returnTo={returnTo}
                      initiallySaved={
                        savedMovieSlugs?.has(movie.slug) ?? false
                      }
                    />
                  ) : watchlistConnection.status ===
                    "unauthenticated" ? (
                    <MovieWatchlistAction
                      state="unauthenticated"
                      returnTo={returnTo}
                    />
                  ) : (
                    <MovieWatchlistAction state="unavailable" />
                  )}
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
