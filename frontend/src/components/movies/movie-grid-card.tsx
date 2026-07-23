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
    <article className="group relative isolate flex h-full min-w-0 overflow-hidden rounded-xl border border-border bg-white shadow-[0_5px_14px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
      <Link
        href={`/movies/${movie.slug}`}
        aria-label={`View details for ${movie.title}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
        <span className="sr-only">View {movie.title}</span>
      </Link>

      <div className="relative aspect-[2/3] w-24 shrink-0 bg-secondary sm:w-28">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 767px) 6rem, 7rem"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-3">
        <time
          dateTime={movie.releaseDate}
          className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-primary"
        >
          {releaseDateFormatter.format(toUtcDate(movie.releaseDate))}
        </time>
        <h2 className="mt-1 text-base font-semibold leading-tight tracking-[-0.025em] transition-colors duration-150 group-hover:text-primary sm:text-lg">
          {movie.title}
        </h2>
        <p className="mt-1.5 line-clamp-2 text-xs leading-4 text-muted">
          {movie.description}
        </p>

        <div className="mt-auto pt-2">
          <ul className="flex flex-wrap gap-1" aria-label="Genres">
            {movie.genres.slice(0, 3).map((genre) => (
              <li
                key={genre.slug}
                className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[0.65rem] font-medium text-primary"
              >
                {genre.name}
              </li>
            ))}
          </ul>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
            <p className="text-[0.65rem] text-subtle">
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
      className="flex h-full overflow-hidden rounded-xl border border-border bg-white shadow-[0_5px_14px_rgba(15,23,42,0.05)]"
      aria-hidden="true"
    >
      <div className="skeleton-surface aspect-[2/3] w-24 shrink-0 sm:w-28" />

      <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-3">
        <div className="skeleton-surface h-2.5 w-20 rounded-full" />
        <div className="skeleton-surface mt-2 h-5 w-2/3 rounded-md" />
        <div className="skeleton-surface mt-2.5 h-3 w-full rounded-full" />
        <div className="skeleton-surface mt-2 h-3 w-4/5 rounded-full" />

        <div className="mt-auto pt-2">
          <div className="flex gap-1">
            <div className="skeleton-surface h-4 w-12 rounded-full" />
            <div className="skeleton-surface h-4 w-14 rounded-full" />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="skeleton-surface h-2.5 w-10 rounded-full" />
            <div className="skeleton-surface h-8 w-28 rounded-lg" />
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
