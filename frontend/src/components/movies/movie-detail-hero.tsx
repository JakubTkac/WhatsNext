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
    <section className="grid items-start gap-8 lg:grid-cols-[minmax(15rem,24rem)_minmax(0,1fr)] lg:gap-12">
      <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] bg-secondary shadow-[0_24px_70px_rgba(15,23,42,0.14)] ring-1 ring-black/5">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            loading="eager"
            sizes="(max-width: 1023px) 90vw, 24rem"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover" />
        )}
      </div>

      <div className="pt-1 lg:pt-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-muted">
          <time dateTime={movie.releaseDate}>
            {releaseDateFormatter.format(toUtcDate(movie.releaseDate))}
          </time>
          <span className="text-border" aria-hidden="true">
            /
          </span>
          <span>{formatRuntime(movie.runtimeMinutes)}</span>
        </div>

        <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
          {movie.title}
        </h1>

        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Genres">
          {movie.genres.map((genre) => (
            <li
              key={genre.slug}
              className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              {genre.name}
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-3xl text-base leading-8 text-muted sm:text-lg">
          {movie.description}
        </p>

        <dl className="mt-9 grid max-w-xl grid-cols-2 divide-x divide-border border-y border-border py-5">
          <div className="pr-6">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
              Average rating
            </dt>
            <dd className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              {movie.averageRating === null
                ? "Not rated"
                : `${movie.averageRating}/10`}
            </dd>
          </div>
          <div className="pl-6">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
              Community reviews
            </dt>
            <dd className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              {movie.reviewCount}
            </dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">{children}</div>
      </div>
    </section>
  );
}

export function MovieDetailHeroSkeleton() {
  return (
    <section
      className="grid items-start gap-8 lg:grid-cols-[minmax(15rem,24rem)_minmax(0,1fr)] lg:gap-12"
      aria-hidden="true"
    >
      <div className="skeleton-surface aspect-[2/3] overflow-hidden rounded-[2rem] shadow-[0_24px_70px_rgba(15,23,42,0.14)]" />

      <div className="pt-1 lg:pt-6">
        <div className="flex items-center gap-3">
          <div className="skeleton-surface h-4 w-28 rounded-full" />
          <div className="skeleton-surface h-4 w-16 rounded-full" />
        </div>

        <div className="skeleton-surface mt-5 h-16 w-full max-w-4xl rounded-xl lg:h-20" />
        <div className="skeleton-surface mt-3 h-16 w-2/3 max-w-2xl rounded-xl lg:h-20" />

        <div className="mt-7 flex gap-2">
          <div className="skeleton-surface h-7 w-20 rounded-full" />
          <div className="skeleton-surface h-7 w-24 rounded-full" />
          <div className="skeleton-surface h-7 w-16 rounded-full" />
        </div>

        <div className="skeleton-surface mt-8 h-5 w-full max-w-3xl rounded-full" />
        <div className="skeleton-surface mt-3 h-5 w-11/12 max-w-3xl rounded-full" />
        <div className="skeleton-surface mt-3 h-5 w-3/5 max-w-xl rounded-full" />

        <div className="mt-9 grid max-w-xl grid-cols-2 divide-x divide-border border-y border-border py-5">
          <div className="pr-6">
            <div className="skeleton-surface h-3 w-28 rounded-full" />
            <div className="skeleton-surface mt-3 h-8 w-20 rounded-lg" />
          </div>
          <div className="pl-6">
            <div className="skeleton-surface h-3 w-32 rounded-full" />
            <div className="skeleton-surface mt-3 h-8 w-12 rounded-lg" />
          </div>
        </div>

        <div className="skeleton-surface mt-7 h-11 w-44 rounded-xl" />
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
