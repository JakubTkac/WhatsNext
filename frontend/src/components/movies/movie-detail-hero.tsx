import Image from "next/image";
import type { ReactNode } from "react";
import type { MovieDetails } from "@/lib/api";

const releaseDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

export function MovieDetailHero({
  movie,
  children,
}: {
  movie: MovieDetails;
  children: ReactNode;
}) {
  return (
    <section className="grid items-start gap-3 sm:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)] sm:gap-5">
      <div className="relative mx-auto aspect-[2/3] w-44 max-w-[52vw] overflow-hidden rounded-xl bg-secondary shadow-[0_8px_24px_rgba(15,23,42,0.12)] sm:mx-0 sm:w-full sm:max-w-none">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            loading="eager"
            sizes="(max-width: 767px) 11rem, 15rem"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover" />
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted">
          <time dateTime={movie.releaseDate}>
            {releaseDateFormatter.format(toUtcDate(movie.releaseDate))}
          </time>
          <span className="text-border" aria-hidden="true">
            /
          </span>
          <span>{formatRuntime(movie.runtimeMinutes)}</span>
        </div>

        <h1 className="mt-2 max-w-5xl text-3xl font-semibold leading-none tracking-[-0.04em] sm:text-4xl lg:text-5xl">
          {movie.title}
        </h1>

        <ul className="mt-3 flex flex-wrap gap-1" aria-label="Genres">
          {movie.genres.map((genre) => (
            <li
              key={genre.slug}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold text-primary"
            >
              {genre.name}
            </li>
          ))}
        </ul>

        <p className="mt-3 max-w-3xl text-xs leading-5 text-muted sm:text-sm">
          {movie.description}
        </p>

        <dl className="mt-4 grid max-w-xl grid-cols-2 divide-x divide-border border-y border-border py-2.5">
          <div className="pr-3">
            <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-subtle">
              Average rating
            </dt>
            <dd className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              {movie.averageRating === null
                ? "Not rated"
                : `${movie.averageRating}/10`}
            </dd>
          </div>
          <div className="pl-3">
            <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-subtle">
              Community reviews
            </dt>
            <dd className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              {movie.reviewCount}
            </dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap gap-2">{children}</div>
      </div>
    </section>
  );
}

export function MovieDetailHeroSkeleton() {
  return (
    <section
      className="grid items-start gap-3 sm:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)] sm:gap-5"
      aria-hidden="true"
    >
      <div className="skeleton-surface mx-auto aspect-[2/3] w-44 max-w-[52vw] overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] sm:mx-0 sm:w-full sm:max-w-none" />

      <div>
        <div className="flex items-center gap-3">
          <div className="skeleton-surface h-4 w-28 rounded-full" />
          <div className="skeleton-surface h-4 w-16 rounded-full" />
        </div>

        <div className="skeleton-surface mt-2 h-9 w-full max-w-4xl rounded-lg lg:h-12" />
        <div className="skeleton-surface mt-2 h-9 w-2/3 max-w-2xl rounded-lg lg:h-12" />

        <div className="mt-3 flex gap-1">
          <div className="skeleton-surface h-4 w-14 rounded-full" />
          <div className="skeleton-surface h-4 w-16 rounded-full" />
          <div className="skeleton-surface h-4 w-12 rounded-full" />
        </div>

        <div className="skeleton-surface mt-3 h-3 w-full max-w-3xl rounded-full" />
        <div className="skeleton-surface mt-2 h-3 w-11/12 max-w-3xl rounded-full" />
        <div className="skeleton-surface mt-2 h-3 w-3/5 max-w-xl rounded-full" />

        <div className="mt-4 grid max-w-xl grid-cols-2 divide-x divide-border border-y border-border py-2.5">
          <div className="pr-3">
            <div className="skeleton-surface h-3 w-28 rounded-full" />
            <div className="skeleton-surface mt-2 h-6 w-16 rounded-md" />
          </div>
          <div className="pl-3">
            <div className="skeleton-surface h-3 w-32 rounded-full" />
            <div className="skeleton-surface mt-2 h-6 w-10 rounded-md" />
          </div>
        </div>

        <div className="skeleton-surface mt-3 h-8 w-32 rounded-lg" />
      </div>
    </section>
  );
}

function formatRuntime(runtimeMinutes: number | null): string {
  if (runtimeMinutes === null) {
    return "Runtime TBA";
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
