import { MovieFilters } from "@/components/movies/movie-filters";
import { MovieGridCard } from "@/components/movies/movie-grid-card";
import { MovieWatchlistAction } from "@/components/movies/movie-watchlist-action";
import { PageErrorState } from "@/components/ui/page-error-state";
import { Pagination } from "@/components/ui/pagination";
import { SectionEmptyState } from "@/components/ui/section-state";
import {
  getMoviesPage,
  type MoviesQuery,
} from "@/lib/api";
import { getMovieWatchlist } from "@/lib/watchlist";

type MoviesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const releaseFilters = new Set<MoviesQuery["release"]>([
  "all",
  "upcoming",
  "released",
]);
const movieSorts = new Set<MoviesQuery["sort"]>([
  "releaseAsc",
  "releaseDesc",
  "titleAsc",
]);

export default async function MoviesPage({
  searchParams,
}: MoviesPageProps) {
  const query = parseMoviesQuery(await searchParams);
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

  const returnTo = createMoviesHref(query);
  const savedMovieSlugs =
    watchlistConnection.status === "online"
      ? new Set(watchlistConnection.movieSlugs)
      : null;

  return (
    <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Movie catalogue
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">
          Browse movies
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Find released and upcoming movies by title, genre, and release date.
        </p>
      </div>

      <MovieFilters
        key={JSON.stringify(query)}
        query={query}
        genres={connection.genres}
      />

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
                  initiallySaved={savedMovieSlugs?.has(movie.slug) ?? false}
                />
              ) : watchlistConnection.status === "unauthenticated" ? (
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

      <Pagination
        currentPage={connection.meta.page}
        totalPages={connection.meta.totalPages}
        pathname="/movies"
        query={{
          search: query.search,
          genre: query.genre,
          release: query.release === "all" ? undefined : query.release,
          sort: query.sort === "releaseAsc" ? undefined : query.sort,
        }}
      />
    </main>
  );
}

function parseMoviesQuery(
  params: Record<string, string | string[] | undefined>,
): MoviesQuery {
  const release = readString(params.release);
  const sort = readString(params.sort);

  return {
    page: readPositiveInteger(params.page),
    search: readOptionalString(params.search, 80),
    genre: readOptionalString(params.genre, 100)?.toLowerCase(),
    release: releaseFilters.has(release as MoviesQuery["release"])
      ? (release as MoviesQuery["release"])
      : "all",
    sort: movieSorts.has(sort as MoviesQuery["sort"])
      ? (sort as MoviesQuery["sort"])
      : "releaseAsc",
  };
}

function readPositiveInteger(value: string | string[] | undefined): number {
  const parsed = Number(readString(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function readOptionalString(
  value: string | string[] | undefined,
  maximumLength: number,
): string | undefined {
  const normalized = readString(value).trim().slice(0, maximumLength);
  return normalized || undefined;
}

function readString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function createMoviesHref(query: MoviesQuery): string {
  const params = new URLSearchParams();

  if (query.page > 1) {
    params.set("page", String(query.page));
  }

  if (query.search) {
    params.set("search", query.search);
  }

  if (query.genre) {
    params.set("genre", query.genre);
  }

  if (query.release !== "all") {
    params.set("release", query.release);
  }

  if (query.sort !== "releaseAsc") {
    params.set("sort", query.sort);
  }

  const search = params.toString();
  return search ? `/movies?${search}` : "/movies";
}
