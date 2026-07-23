import "server-only";

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

type UpcomingMoviesResponse = {
  items: MovieSummary[];
};

export type BackendConnection =
  { online: true; health: BackendHealth } | { online: false };

export type UpcomingMoviesConnection =
  { online: true; movies: MovieSummary[] } | { online: false };

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
