import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { MovieSummary } from "@/lib/api";

const releaseDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

export function MovieGridCard({
  movie,
  children,
}: {
  movie: MovieSummary;
  children?: ReactNode;
}) {
  return (
    <article className="group relative isolate flex h-full overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_42px_rgba(15,23,42,0.1)]">
      <Link
        href={`/movies/${movie.slug}`}
        aria-label={`View details for ${movie.title}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
        <span className="sr-only">View {movie.title}</span>
      </Link>

      <div className="relative aspect-[2/3] w-32 shrink-0 bg-secondary sm:w-40">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 639px) 128px, 160px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <time
          dateTime={movie.releaseDate}
          className="text-xs font-semibold uppercase tracking-[0.1em] text-primary"
        >
          {releaseDateFormatter.format(toUtcDate(movie.releaseDate))}
        </time>
        <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.035em] transition-colors duration-150 group-hover:text-primary">
          {movie.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
          {movie.description}
        </p>

        <div className="mt-auto pt-5">
          <ul className="flex flex-wrap gap-1.5" aria-label="Genres">
            {movie.genres.slice(0, 3).map((genre) => (
              <li
                key={genre.slug}
                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {genre.name}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-subtle">
              {formatRuntime(movie.runtimeMinutes)}
            </p>
            {children ? (
              <div className="relative z-20">{children}</div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function MovieGridCardSkeleton() {
  return (
    <article
      className="flex h-full overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
      aria-hidden="true"
    >
      <div className="skeleton-surface aspect-[2/3] w-32 shrink-0 sm:w-40" />

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="skeleton-surface h-3 w-24 rounded-full" />
        <div className="skeleton-surface mt-3 h-6 w-2/3 rounded-lg" />
        <div className="skeleton-surface mt-5 h-4 w-full rounded-full" />
        <div className="skeleton-surface mt-3 h-4 w-11/12 rounded-full" />
        <div className="skeleton-surface mt-3 h-4 w-3/5 rounded-full" />

        <div className="mt-auto pt-5">
          <div className="flex gap-2">
            <div className="skeleton-surface h-6 w-16 rounded-full" />
            <div className="skeleton-surface h-6 w-20 rounded-full" />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="skeleton-surface h-3 w-12 rounded-full" />
            <div className="skeleton-surface h-10 w-44 rounded-xl" />
          </div>
        </div>
      </div>
    </article>
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
