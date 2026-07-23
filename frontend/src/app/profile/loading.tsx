import { UpcomingMovieCarouselSkeleton } from "@/components/movies/upcoming-movie-carousel";
import { ReviewCardsSkeleton } from "@/components/reviews/review-card";

export default function Loading() {
  return (
    <main
      className="page-shell"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <span className="sr-only">Loading profile</span>

      <section
        className="overflow-hidden rounded-xl border border-border bg-secondary/55 p-3 shadow-[0_6px_18px_rgba(15,23,42,0.05)] sm:p-4"
        aria-hidden="true"
      >
        <div className="grid items-start gap-3 min-[36rem]:grid-cols-[auto_minmax(0,1fr)]">
          <div className="skeleton-surface h-18 w-18 rounded-full sm:h-20 sm:w-20" />
          <div className="min-w-0">
            <div className="h-9 w-56 max-w-full rounded-lg bg-slate-300" />
            <div className="mt-1 h-3 w-44 rounded-full bg-slate-200" />
            <div className="mt-2 h-3 w-full max-w-2xl rounded-full bg-slate-200" />
            <div className="mt-2 h-3 w-3/5 max-w-xl rounded-full bg-slate-200" />
            <div className="mt-3 flex gap-2 border-t border-border/80 pt-3">
              <div className="h-8 w-24 rounded-lg bg-slate-200" />
              <div className="h-8 w-32 rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 space-y-7">
        <section aria-hidden="true">
          <ActivityHeadingSkeleton />
          <UpcomingMovieCarouselSkeleton extendedDescription={false} />
        </section>

        <section aria-hidden="true">
          <ActivityHeadingSkeleton />
          <ReviewCardsSkeleton />
        </section>
      </div>
    </main>
  );
}

function ActivityHeadingSkeleton() {
  return (
    <div className="flex flex-col items-start justify-between gap-2 min-[36rem]:flex-row min-[36rem]:items-end">
      <div className="w-full max-w-xl">
        <div className="h-7 w-56 max-w-full rounded-lg bg-slate-300" />
        <div className="mt-1 h-3 w-72 max-w-full rounded-full bg-slate-200" />
      </div>
      <div className="h-8 w-32 rounded-lg bg-slate-200" />
    </div>
  );
}
