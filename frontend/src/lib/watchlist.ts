import "server-only";
import { getAccessToken } from "@/lib/auth";

export type MovieWatchlistConnection =
  | { status: "unauthenticated" }
  | { status: "unavailable" }
  | { status: "online"; movieSlugs: string[] };

type WatchlistResponse = {
  items: Array<{
    movie: {
      slug: string;
    };
  }>;
};

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";

export async function getMovieWatchlist(): Promise<MovieWatchlistConnection> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { status: "unauthenticated" };
  }

  try {
    const response = await fetch(`${apiUrl}/watchlist`, {
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
    };
  } catch {
    return { status: "unavailable" };
  }
}

function isWatchlistResponse(value: unknown): value is WatchlistResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(
      (item) =>
        isRecord(item) &&
        isRecord(item.movie) &&
        typeof item.movie.slug === "string",
    )
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
