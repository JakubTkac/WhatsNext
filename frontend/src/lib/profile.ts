import "server-only";
import { cache } from "react";
import { getAccessToken } from "@/lib/auth";

export type ProfileMovie = {
  slug: string;
  title: string;
  releaseDate: string;
  posterUrl: string | null;
  runtimeMinutes: number | null;
  genres: Array<{
    name: string;
    slug: string;
  }>;
};

export type ProfileReview = {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  movie: ProfileMovie;
};

export type ProfileWatchlistItem = {
  id: string;
  addedAt: string;
  watchedAt: string | null;
  movie: ProfileMovie;
};

export type Profile = {
  id: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  stats: {
    watchlistCount: number;
    reviewCount: number;
  };
  recentReviews: ProfileReview[];
  watchlistPreview: ProfileWatchlistItem[];
};

export type ProfileConnection =
  | { status: "online"; profile: Profile }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";

export const getProfile = cache(async (): Promise<ProfileConnection> => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { status: "unauthenticated" };
  }

  try {
    const response = await fetch(`${apiUrl}/users/me`, {
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

    const value: unknown = await response.json();
    return isProfile(value)
      ? { status: "online", profile: value }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
});

function isProfile(value: unknown): value is Profile {
  if (!isRecord(value) || !isRecord(value.stats)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.displayName === "string" &&
    (typeof value.bio === "string" || value.bio === null) &&
    (typeof value.avatarUrl === "string" || value.avatarUrl === null) &&
    typeof value.createdAt === "string" &&
    typeof value.stats.watchlistCount === "number" &&
    typeof value.stats.reviewCount === "number" &&
    Array.isArray(value.recentReviews) &&
    value.recentReviews.every(isProfileReview) &&
    Array.isArray(value.watchlistPreview) &&
    value.watchlistPreview.every(isProfileWatchlistItem)
  );
}

function isProfileReview(value: unknown): value is ProfileReview {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.rating === "number" &&
    typeof value.body === "string" &&
    typeof value.createdAt === "string" &&
    isProfileMovie(value.movie)
  );
}

function isProfileWatchlistItem(
  value: unknown,
): value is ProfileWatchlistItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.addedAt === "string" &&
    (typeof value.watchedAt === "string" || value.watchedAt === null) &&
    isProfileMovie(value.movie)
  );
}

function isProfileMovie(value: unknown): value is ProfileMovie {
  return (
    isRecord(value) &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.releaseDate === "string" &&
    (typeof value.posterUrl === "string" || value.posterUrl === null) &&
    (typeof value.runtimeMinutes === "number" ||
      value.runtimeMinutes === null) &&
    Array.isArray(value.genres) &&
    value.genres.every(isProfileGenre)
  );
}

function isProfileGenre(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.slug === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
