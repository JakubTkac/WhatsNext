import { ReviewCardsSkeleton } from "@/components/reviews/review-card";

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

        <ReviewCardsSkeleton />
      </div>
    </section>
  );
}
