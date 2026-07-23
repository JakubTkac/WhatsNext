"use client";

import { useEffect, useRef } from "react";
import {
  normalizeRecentlyViewedMovie,
  parseRecentlyViewedMovies,
  RECENTLY_VIEWED_MOVIES_LIMIT,
  RECENTLY_VIEWED_MOVIES_STORAGE_KEY,
  RECENTLY_VIEWED_MOVIES_UPDATED_EVENT,
  serializeRecentlyViewedMovies,
  type RecentlyViewedMovie,
} from "@/lib/recently-viewed-movies";

export function RecentlyViewedMovieTracker({
  movie,
}: {
  movie: RecentlyViewedMovie;
}) {
  const requested = useRef(false);
  const { posterUrl, slug, title } = movie;

  useEffect(() => {
    if (requested.current) {
      return;
    }

    requested.current = true;
    const normalizedMovie = normalizeRecentlyViewedMovie({
      posterUrl,
      slug,
      title,
    });

    if (!normalizedMovie) {
      return;
    }

    try {
      const currentMovies = parseRecentlyViewedMovies(
        window.localStorage.getItem(RECENTLY_VIEWED_MOVIES_STORAGE_KEY),
      );

      if (isSameMovie(currentMovies.at(0), normalizedMovie)) {
        return;
      }

      const updatedMovies = [
        normalizedMovie,
        ...currentMovies.filter(
          (currentMovie) => currentMovie.slug !== normalizedMovie.slug,
        ),
      ].slice(0, RECENTLY_VIEWED_MOVIES_LIMIT);

      window.localStorage.setItem(
        RECENTLY_VIEWED_MOVIES_STORAGE_KEY,
        serializeRecentlyViewedMovies(updatedMovies),
      );
      window.dispatchEvent(
        new Event(RECENTLY_VIEWED_MOVIES_UPDATED_EVENT),
      );
    } catch {
      // Browsing remains available if local storage is disabled or full.
    }
  }, [posterUrl, slug, title]);

  return null;
}

function isSameMovie(
  first: RecentlyViewedMovie | undefined,
  second: RecentlyViewedMovie,
): boolean {
  return (
    first?.slug === second.slug &&
    first.title === second.title &&
    first.posterUrl === second.posterUrl
  );
}
