import "server-only";
import type {
  GenreSummary,
  MoviesQuery,
  MovieSummary,
  PaginationMeta,
} from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export type WatchlistItem = {
  id: string;
  addedAt: string;
  watchedAt: string | null;
  movie: MovieSummary;
};

export type MovieWatchlistConnection =
  | { status: "unauthenticated" }
  | { status: "unavailable" }
  | {
      status: "online";
      movieSlugs: string[];
      items: WatchlistItem[];
      meta: PaginationMeta;
      genres: GenreSummary[];
    };

type WatchlistResponse = {
  items: WatchlistItem[];
  meta: PaginationMeta;
  genres: GenreSummary[];
};

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";

export async function getMovieWatchlist(
  query?: MoviesQuery,
): Promise<MovieWatchlistConnection> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { status: "unauthenticated" };
  }

  try {
    const url = createWatchlistUrl(query);
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(5_000),
    });

    if (response.status === 401 || response.status === 403) {
      return { status: "unauthenticated" };
    }

    if (!response.ok) {
      return { status: "unavailable" };
    }

    const payload: unknown = await response.json();

    if (!isWatchlistResponse(payload)) {
      return { status: "unavailable" };
    }

    return {
      status: "online",
      movieSlugs: payload.items.map((item) => item.movie.slug),
      items: payload.items,
      meta: payload.meta,
      genres: payload.genres,
    };
  } catch {
    return { status: "unavailable" };
  }
}

function isWatchlistResponse(value: unknown): value is WatchlistResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isWatchlistItem) &&
    isPaginationMeta(value.meta) &&
    Array.isArray(value.genres) &&
    value.genres.every(isGenreSummary)
  );
}

function createWatchlistUrl(query?: MoviesQuery): URL {
  const url = new URL(`${apiUrl}/watchlist`);
  url.searchParams.set("page", String(query?.page ?? 1));
  url.searchParams.set("limit", query ? "12" : "500");
  url.searchParams.set("release", query?.release ?? "all");
  url.searchParams.set("sort", query?.sort ?? "releaseAsc");

  if (query?.search) {
    url.searchParams.set("search", query.search);
  }

  if (query?.genre) {
    url.searchParams.set("genre", query.genre);
  }

  return url;
}

function isWatchlistItem(value: unknown): value is WatchlistItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.addedAt === "string" &&
    (typeof value.watchedAt === "string" || value.watchedAt === null) &&
    isMovieSummary(value.movie)
  );
}

function isMovieSummary(value: unknown): value is MovieSummary {
  return (
    isRecord(value) &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.releaseDate === "string" &&
    (typeof value.runtimeMinutes === "number" ||
      value.runtimeMinutes === null) &&
    (typeof value.posterUrl === "string" || value.posterUrl === null) &&
    Array.isArray(value.genres) &&
    value.genres.every(
      (genre) =>
        isRecord(genre) &&
        typeof genre.name === "string" &&
        typeof genre.slug === "string",
    )
  );
}

function isGenreSummary(value: unknown): value is GenreSummary {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.slug === "string"
  );
}

function isPaginationMeta(value: unknown): value is PaginationMeta {
  return (
    isRecord(value) &&
    typeof value.page === "number" &&
    Number.isInteger(value.page) &&
    typeof value.limit === "number" &&
    Number.isInteger(value.limit) &&
    typeof value.totalItems === "number" &&
    Number.isInteger(value.totalItems) &&
    typeof value.totalPages === "number" &&
    Number.isInteger(value.totalPages)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
