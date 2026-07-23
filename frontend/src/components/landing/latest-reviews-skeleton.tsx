import { ReviewCardsSkeleton } from "@/components/reviews/review-card";

export function LatestReviewsSkeleton() {
  return (
    <section
      className="mt-8 pb-10"
      aria-label="Loading latest reviews"
      aria-busy="true"
    >
      <span className="sr-only">Loading latest reviews</span>
      <div aria-hidden="true">
        <div className="h-7 w-48 rounded-lg bg-slate-300" />

        <ReviewCardsSkeleton />
      </div>
    </section>
  );
}
