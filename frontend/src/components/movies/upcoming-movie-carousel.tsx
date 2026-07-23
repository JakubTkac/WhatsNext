"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HorizontalScroller } from "@/components/ui/horizontal-scroller";
import type { MovieSummary } from "@/lib/api";

const releaseDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

type BaseCarouselMovie = Pick<
  MovieSummary,
  | "genres"
  | "posterUrl"
  | "releaseDate"
  | "runtimeMinutes"
  | "slug"
  | "title"
>;

type ExtendedCarouselMovie = BaseCarouselMovie &
  Pick<MovieSummary, "description">;

type UpcomingMovieCarouselProps =
  | {
      extendedDescription: true;
      movies: ExtendedCarouselMovie[];
      seamless?: boolean;
    }
  | {
      extendedDescription: false;
      movies: BaseCarouselMovie[];
      seamless?: false;
    };

const carouselSkeletonItems = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const activeMoviePanelId = "upcoming-active-movie";

export function UpcomingMovieCarousel(
  props: UpcomingMovieCarouselProps,
) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const activeMovie = props.extendedDescription
    ? (props.movies.find((movie) => movie.slug === selectedSlug) ??
      props.movies.at(0))
    : undefined;

  return (
    <div>
      <HorizontalScroller
        label="Upcoming movies"
        flushBottom={props.extendedDescription}
        roundedTop={props.seamless}
      >
        <ol
          className={`movie-strip-list ${
            props.seamless ? "movie-strip-list--seamless" : ""
          }`}
          aria-label="Upcoming movies"
        >
          {props.movies.map((movie, index) => (
            <MoviePosterCard
              key={movie.slug}
              movie={movie}
              seamless={Boolean(props.seamless)}
              eager={index === 0}
              active={movie.slug === activeMovie?.slug}
              descriptionPanelId={
                props.extendedDescription
                  ? activeMoviePanelId
                  : undefined
              }
              onSelect={
                props.extendedDescription
                  ? () => setSelectedSlug(movie.slug)
                  : undefined
              }
            />
          ))}
        </ol>
      </HorizontalScroller>

      {activeMovie ? (
        <div
          id={activeMoviePanelId}
          aria-live="polite"
          aria-atomic="true"
        >
          <Link
            href={`/movies/${activeMovie.slug}`}
            aria-label={`View details for ${activeMovie.title}`}
            className={`group/details block focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary ${
              props.seamless ? "rounded-b-xl" : "rounded-xl"
            }`}
          >
            <article
              className={`grid min-h-28 gap-2 bg-slate-950 p-2.5 text-white shadow-[0_8px_22px_rgba(15,23,42,0.14)] transition-[background-color,box-shadow] duration-150 group-hover/details:bg-blue-950 group-hover/details:shadow-[0_12px_28px_rgba(15,23,42,0.2)] group-focus-visible/details:bg-blue-950 min-[36rem]:grid-cols-[minmax(0,1fr)_auto] min-[36rem]:items-end sm:p-3 motion-reduce:transition-none ${
                props.seamless ? "rounded-b-xl" : "rounded-xl"
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h3 className="line-clamp-2 min-h-10 text-lg font-semibold leading-5 tracking-[-0.03em] min-[36rem]:line-clamp-1 min-[36rem]:min-h-0">
                    {activeMovie.title}
                  </h3>
                  <span className="shrink-0 text-[0.65rem] font-medium text-blue-100">
                    {releaseDateFormatter.format(
                      toUtcDate(activeMovie.releaseDate),
                    )}{" "}
                    / {formatRuntime(activeMovie.runtimeMinutes)}
                  </span>
                </div>
                <p
                  id={`upcoming-active-description-${activeMovie.slug}`}
                  className="mt-1 line-clamp-3 min-h-12 max-w-[75ch] break-words text-xs leading-4 text-blue-50/80"
                >
                  {activeMovie.description}
                </p>
                {props.seamless ? (
                  <ul
                    className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[0.6rem] font-medium text-blue-100"
                    aria-label="Genres"
                  >
                    {activeMovie.genres.map((genre) => (
                      <li key={genre.slug}>{genre.name}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <span className="text-[0.65rem] font-semibold text-blue-100 transition-transform duration-150 group-hover/details:translate-x-0.5 group-focus-visible/details:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none">
                View details <span aria-hidden="true">&rarr;</span>
              </span>
            </article>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function UpcomingMovieCarouselSkeleton({
  extendedDescription,
  seamless = false,
}: {
  extendedDescription: boolean;
  seamless?: boolean;
}) {
  return (
    <div aria-hidden="true">
      <div
        className={`relative mt-3 overflow-hidden ${
          seamless ? "rounded-t-xl" : ""
        }`}
      >
        <div
          className={`movie-strip w-full overflow-hidden pt-1 ${
            extendedDescription ? "pb-0" : "pb-3"
          }`}
        >
          <div
            className={`movie-strip-list ${
              seamless ? "movie-strip-list--seamless" : ""
            }`}
          >
            {carouselSkeletonItems.map((item) => (
              <div
                key={item}
                className={`skeleton-surface relative aspect-[2/3] min-w-0 overflow-hidden shadow-[0_8px_22px_rgba(15,23,42,0.09)] ring-1 ring-black/10 ${
                  seamless ? "" : "rounded-xl"
                }`}
              >
                {seamless ? null : (
                  <div className="absolute inset-x-0 top-0 flex justify-between p-1.5">
                    <div className="h-4 w-16 rounded-full bg-white/75 ring-1 ring-black/5" />
                    <div className="h-4 w-10 rounded-full bg-white/75 ring-1 ring-black/5" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-400/35 to-transparent p-2 pt-10">
                  <div className="h-4 w-3/4 rounded-lg bg-slate-500/40" />
                  <div className="mt-1.5 h-3 w-1/2 rounded-full bg-slate-500/25" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {extendedDescription ? (
        <div
          className={`min-h-28 bg-slate-300 p-2.5 sm:p-3 ${
            seamless ? "rounded-b-xl" : "rounded-xl"
          }`}
        >
          <div className="skeleton-surface h-5 w-48 max-w-full rounded-lg" />
          <div className="skeleton-surface mt-2 h-3 w-full max-w-3xl rounded-full" />
          <div className="skeleton-surface mt-1.5 h-3 w-4/5 max-w-2xl rounded-full" />
          <div className="skeleton-surface mt-2 h-3 w-20 rounded-full" />
        </div>
      ) : null}
    </div>
  );
}

function MoviePosterCard({
  active,
  descriptionPanelId,
  eager,
  movie,
  onSelect,
  seamless,
}: {
  active: boolean;
  descriptionPanelId?: string;
  eager: boolean;
  movie: BaseCarouselMovie;
  onSelect?: () => void;
  seamless: boolean;
}) {
  const releaseDate = toUtcDate(movie.releaseDate);

  return (
    <li className="min-w-0 snap-start">
      <Link
        href={`/movies/${movie.slug}`}
        aria-label={`View details for ${movie.title}`}
        aria-controls={descriptionPanelId}
        aria-describedby={
          active
            ? `upcoming-active-description-${movie.slug}`
            : undefined
        }
        data-active={active ? "true" : undefined}
        onPointerEnter={onSelect}
        onFocus={onSelect}
        className={`group/movie block focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary ${
          seamless ? "" : "rounded-xl"
        }`}
      >
        <article
          className={`relative aspect-[2/3] overflow-hidden bg-secondary shadow-[0_8px_22px_rgba(15,23,42,0.1)] transition-[box-shadow,transform] duration-200 group-hover/movie:-translate-y-0.5 group-hover/movie:shadow-[0_12px_28px_rgba(15,23,42,0.16)] group-focus-visible/movie:-translate-y-0.5 group-focus-visible/movie:shadow-[0_12px_28px_rgba(15,23,42,0.16)] motion-reduce:transform-none motion-reduce:transition-none ${
            seamless ? "" : "rounded-xl"
          } ${
            active
              ? "ring-2 ring-primary"
              : "ring-1 ring-black/5"
          }`}
        >
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={`${movie.title} poster`}
              fill
              loading={eager ? "eager" : "lazy"}
              sizes="(max-width: 767px) 44vw, (max-width: 1228px) 31vw, (max-width: 1535px) 23.5vw, 18.5vw"
              className="object-cover transition-transform duration-300 group-hover/movie:scale-[1.025] group-focus-visible/movie:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-black/10" />

          {seamless ? null : (
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-1 p-1.5">
              <time
                dateTime={movie.releaseDate}
                className="whitespace-nowrap rounded-full bg-white/95 px-1.5 py-0.5 text-[0.6rem] font-semibold leading-3.5 text-foreground shadow-sm backdrop-blur-md"
              >
                {releaseDateFormatter.format(releaseDate)}
              </time>
              <span className="whitespace-nowrap rounded-full bg-black/65 px-1.5 py-0.5 text-[0.6rem] font-medium leading-3.5 text-white backdrop-blur-md">
                {formatRuntime(movie.runtimeMinutes)}
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-2">
            <h2 className="line-clamp-2 text-sm font-semibold leading-tight tracking-[-0.03em] text-white transition-colors duration-150 group-hover/movie:text-blue-100 group-focus-visible/movie:text-blue-100 sm:text-base lg:text-lg">
              {movie.title}
            </h2>
            {seamless ? null : (
              <ul
                className="mt-1.5 flex flex-wrap gap-1"
                aria-label="Genres"
              >
                {movie.genres.slice(0, 2).map((genre) => (
                  <li
                    key={genre.slug}
                    className="rounded-full border border-white/20 bg-white/10 px-1 py-px text-[0.55rem] font-medium leading-3 text-white/90 backdrop-blur-sm"
                  >
                    {genre.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      </Link>
    </li>
  );
}

function formatRuntime(runtimeMinutes: number | null): string {
  if (runtimeMinutes === null) {
    return "TBA";
  }

  const hours = Math.floor(runtimeMinutes / 60);
  const minutes = runtimeMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function toUtcDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}
