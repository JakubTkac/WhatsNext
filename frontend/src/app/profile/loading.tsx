import { UpcomingMovieCarouselSkeleton } from "@/components/movies/upcoming-movie-carousel";
import { ReviewCardsSkeleton } from "@/components/reviews/review-card";

export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <span className="sr-only">Loading profile</span>

      <section
        className="overflow-hidden rounded-[2rem] border border-border bg-secondary/55 px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:px-10 sm:py-10"
        aria-hidden="true"
      >
        <div className="grid items-start gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
          <div className="skeleton-surface h-32 w-32 rounded-full sm:h-36 sm:w-36" />
          <div className="min-w-0">
            <div className="mt-2 h-12 w-64 max-w-full rounded-xl bg-slate-300" />
            <div className="mt-3 h-4 w-52 rounded-full bg-slate-200" />
            <div className="mt-5 h-5 w-full max-w-2xl rounded-full bg-slate-200" />
            <div className="mt-3 h-5 w-3/5 max-w-xl rounded-full bg-slate-200" />
            <div className="mt-7 flex gap-3 border-t border-border/80 pt-6">
              <div className="h-11 w-28 rounded-xl bg-slate-200" />
              <div className="h-11 w-40 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12 space-y-14">
        <section aria-hidden="true">
          <ActivityHeadingSkeleton />
          <UpcomingMovieCarouselSkeleton />
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
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div className="w-full max-w-xl">
        <div className="h-9 w-64 max-w-full rounded-xl bg-slate-300" />
        <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-slate-200" />
      </div>
      <div className="h-11 w-40 rounded-xl bg-slate-200" />
    </div>
  );
}
