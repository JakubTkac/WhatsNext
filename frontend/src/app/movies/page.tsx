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
import { getMovieWatchlist } from "@/lib/watchlist";

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
    <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <div className="max-w-3xl">
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">
          Browse movies
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
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
            <div className="mt-6">
              <SectionEmptyState
                title="No movies match these filters"
                description="Adjust the title, genre, or release filter and try again."
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
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

      <RecentlyViewedMovies className="mt-20" />
    </main>
  );
}
