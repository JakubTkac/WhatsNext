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

type UpcomingMovieCarouselProps = {
  movies: Array<
    Pick<
      MovieSummary,
      | "genres"
      | "posterUrl"
      | "releaseDate"
      | "runtimeMinutes"
      | "slug"
      | "title"
    >
  >;
};

const carouselSkeletonItems = [0, 1, 2, 3, 4, 5, 6];

export function UpcomingMovieCarousel({
  movies,
}: UpcomingMovieCarouselProps) {
  return (
    <HorizontalScroller label="Upcoming movies">
      <ol className="movie-strip-list" aria-label="Upcoming movies">
        {movies.map((movie, index) => (
          <MoviePosterCard
            key={movie.slug}
            movie={movie}
            eager={index === 0}
          />
        ))}
      </ol>
    </HorizontalScroller>
  );
}

export function UpcomingMovieCarouselSkeleton() {
  return (
    <div className="relative mt-8" aria-hidden="true">
      <div className="movie-strip -mx-3 overflow-hidden px-3 pb-8 pt-2">
        <div className="movie-strip-list">
          {carouselSkeletonItems.map((item) => (
            <div
              key={item}
              className="skeleton-surface relative aspect-[2/3] min-w-0 overflow-hidden rounded-2xl shadow-[0_14px_34px_rgba(15,23,42,0.1)] ring-1 ring-black/10"
            >
              <div className="absolute inset-x-0 top-0 flex justify-between p-5">
                <div className="h-7 w-28 rounded-full bg-white/75 ring-1 ring-black/5" />
                <div className="h-7 w-16 rounded-full bg-white/75 ring-1 ring-black/5" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-400/35 to-transparent p-5 pt-24">
                <div className="h-6 w-3/4 rounded-lg bg-slate-500/40" />
                <div className="mt-3 h-5 w-1/2 rounded-full bg-slate-500/25" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MoviePosterCard({
  movie,
  eager,
}: {
  movie: UpcomingMovieCarouselProps["movies"][number];
  eager: boolean;
}) {
  const releaseDate = toUtcDate(movie.releaseDate);

  return (
    <li className="min-w-0 snap-start">
      <Link
        href={`/movies/${movie.slug}`}
        aria-label={`View details for ${movie.title}`}
        className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <article className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary shadow-[0_14px_34px_rgba(15,23,42,0.12)] ring-1 ring-black/5 transition-[box-shadow,transform] duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_20px_44px_rgba(15,23,42,0.18)]">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={`${movie.title} poster`}
              fill
              loading={eager ? "eager" : "lazy"}
              sizes="(max-width: 639px) 82vw, (max-width: 1023px) 47vw, (max-width: 1279px) 31.5vw, 22rem"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-black/10" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-5">
            <time
              dateTime={movie.releaseDate}
              className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md"
            >
              {releaseDateFormatter.format(releaseDate)}
            </time>
            <span className="rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              {formatRuntime(movie.runtimeMinutes)}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <h2 className="text-xl font-semibold leading-tight tracking-[-0.035em] text-white transition-colors duration-150 group-hover:text-blue-100 sm:text-2xl">
              {movie.title}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Genres">
              {movie.genres.slice(0, 3).map((genre) => (
                <li
                  key={genre.slug}
                  className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.7rem] font-medium text-white/90 backdrop-blur-sm"
                >
                  {genre.name}
                </li>
              ))}
            </ul>
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
