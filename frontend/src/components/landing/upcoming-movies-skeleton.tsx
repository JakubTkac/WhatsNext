import { UpcomingMovieCarouselSkeleton } from "@/components/movies/upcoming-movie-carousel";

export function UpcomingMoviesSkeleton() {
  return (
    <section
      className="pb-10 pt-3"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading upcoming movies"
    >
      <span className="sr-only">Loading upcoming movies</span>
      <div aria-hidden="true">
        <div className="mt-3">
          <div className="h-7 w-52 rounded-lg bg-slate-300" />
        </div>

        <UpcomingMovieCarouselSkeleton extendedDescription seamless />
      </div>
    </section>
  );
}
