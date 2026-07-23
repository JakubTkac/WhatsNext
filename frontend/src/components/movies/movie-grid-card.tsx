import Image from "next/image";
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
    <article className="flex h-full overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="relative aspect-[2/3] w-32 shrink-0 bg-secondary sm:w-40">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 639px) 128px, 160px"
            className="object-cover"
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
        <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.035em]">
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
            {children}
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
