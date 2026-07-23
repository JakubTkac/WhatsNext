import "server-only";
import { getAccessToken } from "@/lib/auth";

type BackendHealth = {
  status: "ok";
  database: "up";
};

export type GenreSummary = {
  name: string;
  slug: string;
};

export type MovieSummary = {
  slug: string;
  title: string;
  description: string;
  releaseDate: string;
  runtimeMinutes: number | null;
  posterUrl: string | null;
  genres: GenreSummary[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

type UpcomingMoviesResponse = {
  items: MovieSummary[];
};

type MoviesResponse = {
  items: MovieSummary[];
  meta: PaginationMeta;
  genres: GenreSummary[];
};

export type BackendConnection =
  { online: true; health: BackendHealth } | { online: false };

export type UpcomingMoviesConnection =
  { online: true; movies: MovieSummary[] } | { online: false };

export type MoviesQuery = {
  page: number;
  search?: string;
  genre?: string;
  release: "all" | "upcoming" | "released";
  sort: "releaseAsc" | "releaseDesc" | "titleAsc";
};

export type MoviesPageConnection =
  | {
      online: true;
      movies: MovieSummary[];
      meta: PaginationMeta;
      genres: GenreSummary[];
    }
  | { online: false };

export type LatestReview = {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  author: {
    displayName: string;
    avatarUrl: string | null;
  };
  movie: {
    slug: string;
    title: string;
    posterUrl: string | null;
  };
};

export type LatestReviewsConnection =
  | { online: true; reviews: LatestReview[] }
  | { online: false };

export type ReviewsQuery = {
  page: number;
  movie?: string;
  rating?: number;
};

export type ReviewsPageConnection =
  | {
      online: true;
      reviews: LatestReview[];
      meta: PaginationMeta;
    }
  | { online: false };

export type ReviewWorkspaceConnection =
  | { status: "unauthenticated" }
  | { status: "unavailable" }
  | {
      status: "online";
      reviews: LatestReview[];
    };

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";

export async function getBackendHealth(): Promise<BackendConnection> {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });

    if (!response.ok) {
      return { online: false };
    }

    const health = (await response.json()) as BackendHealth;

    if (health.status !== "ok" || health.database !== "up") {
      return { online: false };
    }

    return { online: true, health };
  } catch {
    return { online: false };
  }
}

export async function getUpcomingMovies(
  limit = 7,
  search?: string,
): Promise<UpcomingMoviesConnection> {
  try {
    const url = new URL(`${apiUrl}/movies/upcoming`);
    url.searchParams.set("limit", String(limit));

    if (search) {
      url.searchParams.set("search", search);
    }

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });

    if (!response.ok) {
      return { online: false };
    }

    const payload = (await response.json()) as UpcomingMoviesResponse;

    if (!Array.isArray(payload.items)) {
      return { online: false };
    }

    return { online: true, movies: payload.items };
  } catch {
    return { online: false };
  }
}

export async function getMoviesPage(
  query: MoviesQuery,
): Promise<MoviesPageConnection> {
  try {
    const url = new URL(`${apiUrl}/movies`);
    url.searchParams.set("page", String(query.page));
    url.searchParams.set("limit", "12");
    url.searchParams.set("release", query.release);
    url.searchParams.set("sort", query.sort);

    if (query.search) {
      url.searchParams.set("search", query.search);
    }

    if (query.genre) {
      url.searchParams.set("genre", query.genre);
    }

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return { online: false };
    }

    const payload = (await response.json()) as MoviesResponse;

    if (
      !Array.isArray(payload.items) ||
      !Array.isArray(payload.genres) ||
      !isPaginationMeta(payload.meta)
    ) {
      return { online: false };
    }

    return {
      online: true,
      movies: payload.items,
      meta: payload.meta,
      genres: payload.genres,
    };
  } catch {
    return { online: false };
  }
}

export async function getLatestReviews(
  limit = 3,
): Promise<LatestReviewsConnection> {
  try {
    const url = new URL(`${apiUrl}/reviews/latest`);
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });

    if (!response.ok) {
      return { online: false };
    }

    const payload = (await response.json()) as { items: LatestReview[] };

    if (!Array.isArray(payload.items)) {
      return { online: false };
    }

    return { online: true, reviews: payload.items };
  } catch {
    return { online: false };
  }
}

export async function getReviewsPage(
  query: ReviewsQuery,
): Promise<ReviewsPageConnection> {
  try {
    const url = createReviewsUrl(`${apiUrl}/reviews`, query, 12);
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return { online: false };
    }

    const payload = (await response.json()) as {
      items: LatestReview[];
      meta: PaginationMeta;
    };

    if (!Array.isArray(payload.items) || !isPaginationMeta(payload.meta)) {
      return { online: false };
    }

    return {
      online: true,
      reviews: payload.items,
      meta: payload.meta,
    };
  } catch {
    return { online: false };
  }
}

export async function getReviewWorkspace(): Promise<ReviewWorkspaceConnection> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { status: "unauthenticated" };
  }

  try {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const reviewsResponse = await fetch(
      `${apiUrl}/reviews/mine?page=1&limit=24`,
      {
        cache: "no-store",
        headers,
        signal: AbortSignal.timeout(5_000),
      },
    );

    if (
      reviewsResponse.status === 401 ||
      reviewsResponse.status === 403
    ) {
      return { status: "unauthenticated" };
    }

    if (!reviewsResponse.ok) {
      return { status: "unavailable" };
    }

    const reviewsPayload = (await reviewsResponse.json()) as {
      items: LatestReview[];
    };

    if (!Array.isArray(reviewsPayload.items)) {
      return { status: "unavailable" };
    }

    return {
      status: "online",
      reviews: reviewsPayload.items,
    };
  } catch {
    return { status: "unavailable" };
  }
}

function createReviewsUrl(
  baseUrl: string,
  query: ReviewsQuery,
  limit: number,
): URL {
  const url = new URL(baseUrl);
  url.searchParams.set("page", String(query.page));
  url.searchParams.set("limit", String(limit));

  if (query.movie) {
    url.searchParams.set("movie", query.movie);
  }

  if (query.rating) {
    url.searchParams.set("rating", String(query.rating));
  }

  return url;
}

function isPaginationMeta(value: unknown): value is PaginationMeta {
  if (!isRecord(value)) {
    return false;
  }

  return (
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
