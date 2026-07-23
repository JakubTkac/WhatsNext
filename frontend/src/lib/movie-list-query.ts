import type { MoviesQuery } from "@/lib/api";

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

export function parseMoviesQuery(
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

export function createMovieListingHref(
  pathname: string,
  query: MoviesQuery,
): string {
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
  return search ? `${pathname}?${search}` : pathname;
}

export function createMoviePaginationQuery(
  query: MoviesQuery,
): Record<string, string | undefined> {
  return {
    search: query.search,
    genre: query.genre,
    release: query.release === "all" ? undefined : query.release,
    sort: query.sort === "releaseAsc" ? undefined : query.sort,
  };
}

export function createMovieFiltersKey(query: MoviesQuery): string {
  return JSON.stringify({
    search: query.search,
    genre: query.genre,
    release: query.release,
    sort: query.sort,
  });
}

export function hasActiveMovieFilters(query: MoviesQuery): boolean {
  return Boolean(
    query.search || query.genre || query.release !== "all",
  );
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
