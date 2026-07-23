import { UpcomingMovieCarouselSkeleton } from "@/components/movies/upcoming-movie-carousel";

type UpcomingMoviesSkeletonProps = {
  showFeatured?: boolean;
};

export function UpcomingMoviesSkeleton({
  showFeatured = true,
}: UpcomingMoviesSkeletonProps) {
  return (
    <section
      className="pt-10"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading upcoming movies"
    >
      <span className="sr-only">Loading upcoming movies</span>
      <div aria-hidden="true">
        {showFeatured ? (
          <div className="skeleton-surface grid min-h-[34rem] overflow-hidden rounded-[2rem] shadow-[0_24px_70px_rgba(15,23,42,0.12)] md:min-h-[30rem] md:grid-cols-[minmax(0,1fr)_minmax(20rem,32%)]">
            <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
              <div className="h-8 w-52 rounded-full bg-white/65" />
              <div className="mt-7 h-12 w-4/5 rounded-xl bg-slate-500/35 sm:h-16" />
              <div className="mt-5 h-5 w-full max-w-xl rounded-full bg-slate-500/25" />
              <div className="mt-3 h-5 w-3/4 max-w-lg rounded-full bg-slate-500/20" />
              <div className="mt-7 h-7 w-48 rounded-full bg-white/55" />
            </div>
            <div className="min-h-72 bg-slate-400/30" />
          </div>
        ) : null}

        <div className="mt-14 sm:mt-16">
          <div className="h-4 w-36 rounded-full bg-slate-300" />
          <div className="mt-3 h-10 w-72 rounded-xl bg-slate-300" />
        </div>

        <UpcomingMovieCarouselSkeleton />
      </div>
    </section>
  );
}
