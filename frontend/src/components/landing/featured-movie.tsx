import Image from "next/image";
import type { MovieSummary } from "@/lib/api";

const releaseDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

type FeaturedMovieProps = {
  movie: MovieSummary;
};

export function FeaturedMovie({ movie }: FeaturedMovieProps) {
  return (
    <article className="mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-primary-hover text-white shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(20rem,32%)]">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-primary px-3 py-1.5 font-semibold">
              Next release
            </span>
            <time
              dateTime={movie.releaseDate}
              className="font-medium text-blue-100"
            >
              {releaseDateFormatter.format(toUtcDate(movie.releaseDate))}
            </time>
            <span className="text-white/40" aria-hidden="true">
              /
            </span>
            <span className="font-medium text-blue-100">
              {formatRuntime(movie.runtimeMinutes)}
            </span>
          </div>

          <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            {movie.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50/75 sm:text-lg">
            {movie.description}
          </p>

          <ul className="mt-7 flex flex-wrap gap-2" aria-label="Genres">
            {movie.genres.map((genre) => (
              <li
                key={genre.slug}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm"
              >
                {genre.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-80 overflow-hidden md:min-h-[30rem]">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={`${movie.title} poster`}
              fill
              loading="eager"
              sizes="(max-width: 767px) 100vw, 30rem"
              className="object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0 bg-primary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent md:bg-gradient-to-r md:from-blue-950 md:via-transparent md:to-transparent" />
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
