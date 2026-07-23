"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { HorizontalScroller } from "@/components/ui/horizontal-scroller";
import { SectionEmptyState } from "@/components/ui/section-state";
import {
  parseRecentlyViewedMovies,
  RECENTLY_VIEWED_MOVIES_STORAGE_KEY,
  RECENTLY_VIEWED_MOVIES_UPDATED_EVENT,
  type RecentlyViewedMovie,
} from "@/lib/recently-viewed-movies";

export function RecentlyViewedMovies({
  className,
}: {
  className?: string;
}) {
  const movies = useRecentlyViewedMovies();

  return (
    <section
      className={className}
      aria-labelledby="recently-viewed-movies-heading"
    >
      <h2
        id="recently-viewed-movies-heading"
        className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
      >
        Recently viewed movies
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Quickly return to the movies you visited most recently.
      </p>

      {movies.length === 0 ? (
        <div className="mt-8">
          <SectionEmptyState
            title="No recently viewed movies yet"
            description="Open a movie to start building your recently viewed list."
          />
        </div>
      ) : (
        <HorizontalScroller label="Recently viewed movies">
          <ol className="flex w-max min-w-full gap-4 pr-3">
            {movies.map((movie, index) => (
              <li
                key={movie.slug}
                className="w-28 flex-none snap-start sm:w-32 lg:w-36"
              >
                <Link
                  href={`/movies/${movie.slug}`}
                  aria-label={`View details for ${movie.title}`}
                  className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary shadow-[0_10px_26px_rgba(15,23,42,0.11)] ring-1 ring-black/5 transition-[box-shadow,transform] duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_16px_34px_rgba(15,23,42,0.17)]">
                    {movie.posterUrl ? (
                      <Image
                        src={movie.posterUrl}
                        alt={`${movie.title} poster`}
                        fill
                        loading={index === 0 ? "eager" : "lazy"}
                        sizes="(max-width: 639px) 7rem, (max-width: 1023px) 8rem, 9rem"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover" />
                    )}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 transition-colors group-hover:text-primary">
                    {movie.title}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        </HorizontalScroller>
      )}
    </section>
  );
}

function useRecentlyViewedMovies(): RecentlyViewedMovie[] {
  return useSyncExternalStore(
    subscribeToRecentlyViewedMovies,
    getRecentlyViewedMoviesSnapshot,
    getRecentlyViewedMoviesServerSnapshot,
  );
}

const emptyRecentlyViewedMovies: RecentlyViewedMovie[] = [];
let cachedStoredValue: string | null | undefined;
let cachedMovies = emptyRecentlyViewedMovies;

function getRecentlyViewedMoviesSnapshot(): RecentlyViewedMovie[] {
  try {
    const storedValue = window.localStorage.getItem(
      RECENTLY_VIEWED_MOVIES_STORAGE_KEY,
    );

    if (storedValue !== cachedStoredValue) {
      cachedStoredValue = storedValue;
      cachedMovies = parseRecentlyViewedMovies(storedValue);
    }

    return cachedMovies;
  } catch {
    return emptyRecentlyViewedMovies;
  }
}

function getRecentlyViewedMoviesServerSnapshot(): RecentlyViewedMovie[] {
  return emptyRecentlyViewedMovies;
}

function subscribeToRecentlyViewedMovies(
  onStoreChange: () => void,
): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === RECENTLY_VIEWED_MOVIES_STORAGE_KEY
    ) {
      onStoreChange();
    }
  };

  window.addEventListener("pageshow", onStoreChange);
  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    RECENTLY_VIEWED_MOVIES_UPDATED_EVENT,
    onStoreChange,
  );

  return () => {
    window.removeEventListener("pageshow", onStoreChange);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      RECENTLY_VIEWED_MOVIES_UPDATED_EVENT,
      onStoreChange,
    );
  };
}
