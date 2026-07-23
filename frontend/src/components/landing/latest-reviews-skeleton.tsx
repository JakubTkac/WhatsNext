const reviewSkeletons = [0, 1, 2];

export function LatestReviewsSkeleton() {
  return (
    <section
      className="mt-20"
      aria-label="Loading latest reviews"
      aria-busy="true"
    >
      <span className="sr-only">Loading latest reviews</span>
      <div aria-hidden="true">
        <div className="h-10 w-64 rounded-xl bg-slate-300" />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {reviewSkeletons.map((item) => (
            <div
              key={item}
              className="flex min-h-80 flex-col rounded-2xl border border-border/80 bg-white p-5 sm:p-6"
            >
              <div className="flex justify-between gap-3">
                <div className="skeleton-surface h-7 w-16 rounded-full" />
                <div className="h-4 w-12 rounded-full bg-slate-200" />
              </div>
              <div className="mt-6 h-5 w-full rounded-full bg-slate-200" />
              <div className="mt-3 h-5 w-11/12 rounded-full bg-slate-200" />
              <div className="mt-3 h-5 w-3/4 rounded-full bg-slate-200" />
              <div className="mt-auto grid grid-cols-[auto_minmax(0,1fr)_3rem] items-center gap-3 border-t border-border/70 pt-5">
                <div className="skeleton-surface h-9 w-9 rounded-full" />
                <div>
                  <div className="h-4 w-24 rounded-full bg-slate-200" />
                  <div className="mt-2 h-3 w-32 max-w-full rounded-full bg-slate-200" />
                </div>
                <div className="skeleton-surface aspect-[2/3] w-12 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
