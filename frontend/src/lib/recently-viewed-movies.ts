export const RECENTLY_VIEWED_MOVIES_STORAGE_KEY =
  "whatsnext:recently-viewed-movies:v1";
export const RECENTLY_VIEWED_MOVIES_UPDATED_EVENT =
  "whatsnext:recently-viewed-movies-updated";
export const RECENTLY_VIEWED_MOVIES_LIMIT = 10;
const RECENTLY_VIEWED_MOVIES_STORAGE_VERSION = 1;

const movieSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type RecentlyViewedMovie = {
  slug: string;
  title: string;
  posterUrl: string | null;
};

export function parseRecentlyViewedMovies(
  storedValue: string | null | undefined,
): RecentlyViewedMovie[] {
  if (!storedValue) {
    return [];
  }

  let value: unknown;

  try {
    value = JSON.parse(storedValue);
  } catch {
    return [];
  }

  if (
    !isRecord(value) ||
    value.version !== RECENTLY_VIEWED_MOVIES_STORAGE_VERSION ||
    !Array.isArray(value.movies)
  ) {
    return [];
  }

  const movies: RecentlyViewedMovie[] = [];
  const seenSlugs = new Set<string>();

  for (const item of value.movies) {
    if (!Array.isArray(item) || item.length !== 3) {
      continue;
    }

    const movie = normalizeRecentlyViewedMovie({
      slug: item[0],
      title: item[1],
      posterUrl: item[2],
    });

    if (!movie || seenSlugs.has(movie.slug)) {
      continue;
    }

    movies.push(movie);
    seenSlugs.add(movie.slug);

    if (movies.length === RECENTLY_VIEWED_MOVIES_LIMIT) {
      break;
    }
  }

  return movies;
}

export function serializeRecentlyViewedMovies(
  movies: RecentlyViewedMovie[],
): string {
  return JSON.stringify({
    version: RECENTLY_VIEWED_MOVIES_STORAGE_VERSION,
    movies: movies
      .slice(0, RECENTLY_VIEWED_MOVIES_LIMIT)
      .map((movie) => [movie.slug, movie.title, movie.posterUrl]),
  });
}

export function normalizeRecentlyViewedMovie(
  value: unknown,
): RecentlyViewedMovie | null {
  if (!isRecord(value)) {
    return null;
  }

  const slug =
    typeof value.slug === "string" ? value.slug.trim().toLowerCase() : "";
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const posterUrl = normalizePosterUrl(value.posterUrl);

  if (
    !slug ||
    slug.length > 255 ||
    !movieSlugPattern.test(slug) ||
    !title ||
    title.length > 255 ||
    posterUrl === undefined
  ) {
    return null;
  }

  return {
    slug,
    title: title.slice(0, 120),
    posterUrl,
  };
}

function normalizePosterUrl(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || value.length > 256) {
    return undefined;
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" &&
      url.hostname === "image.tmdb.org" &&
      url.port === "" &&
      url.pathname.startsWith("/t/p/w500/") &&
      url.search === ""
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
