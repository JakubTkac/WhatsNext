import { ReviewCardSkeleton } from "@/components/reviews/review-card";

const publicReviewSkeletons = [0, 1, 2, 3, 4, 5];
const ownedReviewSkeletons = [0, 1, 2, 3, 4];

export function ReviewsPageSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16"
      aria-busy="true"
      aria-label="Loading reviews"
    >
      <span className="sr-only">Loading reviews</span>

      <div className="max-w-3xl" aria-hidden="true">
        <div className="skeleton-surface h-14 w-80 max-w-full rounded-xl sm:h-16" />
        <div className="skeleton-surface mt-5 h-5 w-full max-w-2xl rounded-full" />
        <div className="skeleton-surface mt-3 h-5 w-3/5 max-w-lg rounded-full" />
      </div>

      <ReviewFiltersSkeleton />

      <ReviewResultsSkeleton />

      <OwnedReviewsSkeleton />
    </main>
  );
}

export function ReviewResultsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading review results"
    >
      <span className="sr-only">Loading review results</span>
      <div
        className="mt-8 flex items-center justify-between gap-4"
        aria-hidden="true"
      >
        <div className="skeleton-surface h-4 w-20 rounded-full" />
        <div className="skeleton-surface h-4 w-24 rounded-full" />
      </div>

      <div
        className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        aria-hidden="true"
      >
        {publicReviewSkeletons.map((item) => (
          <ReviewCardSkeleton key={item} />
        ))}
      </div>
    </div>
  );
}

function ReviewFiltersSkeleton() {
  return (
    <div
      className="mt-8 grid gap-4 sm:grid-cols-[minmax(14rem,1fr)_12rem_auto] sm:items-end"
      aria-hidden="true"
    >
      <div>
        <div className="skeleton-surface mb-2 h-4 w-12 rounded-full" />
        <div className="skeleton-surface h-11 w-full rounded-xl" />
      </div>
      <div>
        <div className="skeleton-surface mb-2 h-4 w-12 rounded-full" />
        <div className="skeleton-surface h-11 w-full rounded-xl" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton-surface h-11 w-20 flex-1 rounded-xl sm:flex-none" />
        <div className="skeleton-surface h-11 w-20 flex-1 rounded-xl sm:flex-none" />
      </div>
    </div>
  );
}

export function OwnedReviewsSkeleton() {
  return (
    <section className="mt-20" aria-hidden="true">
      <div className="flex items-baseline justify-between gap-4">
        <div className="skeleton-surface h-10 w-52 rounded-xl" />
        <div className="skeleton-surface h-4 w-20 rounded-full" />
      </div>

      <div className="mt-8 divide-y divide-border border-y border-border">
        {ownedReviewSkeletons.map((item) => (
          <div
            key={item}
            className="flex items-start justify-between gap-4 py-6"
          >
            <div className="min-w-0 flex-1">
              <div className="skeleton-surface h-5 w-56 max-w-full rounded-full" />
              <div className="skeleton-surface mt-3 h-4 w-12 rounded-full" />
              <div className="skeleton-surface mt-5 h-4 w-full max-w-3xl rounded-full" />
              <div className="skeleton-surface mt-3 h-4 w-2/3 max-w-2xl rounded-full" />
            </div>
            <div className="hidden gap-2 sm:flex">
              <div className="skeleton-surface h-10 w-16 rounded-xl" />
              <div className="skeleton-surface h-10 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
