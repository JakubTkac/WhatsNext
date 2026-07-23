import { ReviewCardSkeleton } from "@/components/reviews/review-card";

const defaultPublicReviewSkeletonCount = 12;
const defaultOwnedReviewSkeletonCount = 5;

export function ReviewsPageSkeleton() {
  return (
    <main
      className="page-shell"
      aria-busy="true"
      aria-label="Loading reviews"
    >
      <span className="sr-only">Loading reviews</span>

      <div className="max-w-3xl" aria-hidden="true">
        <div className="skeleton-surface h-8 w-64 max-w-full rounded-lg sm:h-9 lg:h-12" />
        <div className="skeleton-surface mt-2 h-3 w-full max-w-2xl rounded-full" />
      </div>

      <ReviewFiltersSkeleton />

      <ReviewResultsBlockSkeleton />

      <OwnedReviewsSkeleton />
    </main>
  );
}

export function ReviewResultsBlockSkeleton() {
  return (
    <>
      <div
        className="mt-4 flex items-center justify-between gap-3"
        aria-hidden="true"
      >
        <div className="skeleton-surface h-4 w-20 rounded-full" />
        <div className="skeleton-surface h-4 w-24 rounded-full" />
      </div>
      <ReviewResultsSkeleton />
    </>
  );
}

export function ReviewResultsSkeleton({
  itemCount = defaultPublicReviewSkeletonCount,
}: {
  itemCount?: number;
}) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading review results"
    >
      <span className="sr-only">Loading review results</span>
      <div
        className="mt-3 grid gap-2.5 min-[36rem]:grid-cols-2 xl:grid-cols-4"
        aria-hidden="true"
      >
        {Array.from({ length: itemCount }, (_, index) => (
          <ReviewCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function ReviewFiltersSkeleton() {
  return (
    <div
      className="mt-4 grid gap-2 min-[36rem]:grid-cols-[minmax(12rem,1fr)_9rem_auto] min-[36rem]:items-end"
      aria-hidden="true"
    >
      <div>
        <div className="skeleton-surface mb-1 h-3 w-12 rounded-full" />
        <div className="skeleton-surface h-9 w-full rounded-lg" />
      </div>
      <div>
        <div className="skeleton-surface mb-1 h-3 w-12 rounded-full" />
        <div className="skeleton-surface h-9 w-full rounded-lg" />
      </div>
      <div className="flex gap-1.5">
        <div className="skeleton-surface h-8 w-16 flex-1 rounded-lg min-[36rem]:flex-none" />
        <div className="skeleton-surface h-8 w-16 flex-1 rounded-lg min-[36rem]:flex-none" />
      </div>
    </div>
  );
}

export function OwnedReviewsSkeleton() {
  return (
    <section className="mt-8" aria-hidden="true">
      <div className="flex items-baseline justify-between gap-4">
        <div className="skeleton-surface h-8 w-44 rounded-lg" />
        <div>
          <div className="skeleton-surface h-4 w-20 rounded-full" />
          <div className="skeleton-surface mt-1 h-3 w-16 rounded-full" />
        </div>
      </div>

      <ReviewFiltersSkeleton />

      <OwnedReviewResultsSkeleton />
    </section>
  );
}

export function OwnedReviewResultsSkeleton({
  itemCount = defaultOwnedReviewSkeletonCount,
}: {
  itemCount?: number;
}) {
  return (
    <div
      className="mt-3 divide-y divide-border border-y border-border"
      aria-busy="true"
      aria-label="Loading your reviews"
    >
      <span className="sr-only">Loading your reviews</span>
      {Array.from({ length: itemCount }, (_, index) => (
        <div
          key={index}
          className="flex items-start justify-between gap-2 py-3"
          aria-hidden="true"
        >
          <div className="min-w-0 flex-1">
            <div className="skeleton-surface h-4 w-56 max-w-full rounded-full" />
            <div className="skeleton-surface mt-1 h-3 w-12 rounded-full" />
            <div className="skeleton-surface mt-2 h-4 w-2/3 max-w-3xl rounded-full" />
          </div>
          <div className="flex gap-1.5">
            <div className="skeleton-surface h-8 w-14 rounded-lg" />
            <div className="skeleton-surface h-8 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
