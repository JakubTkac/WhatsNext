const skeletonItems = [0, 1, 2, 3, 4, 5, 6];

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

        <div className="movie-strip -mx-3 overflow-hidden px-3 pb-8 pt-2">
          <div className="movie-strip-list">
            {skeletonItems.map((item) => (
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
    </section>
  );
}
