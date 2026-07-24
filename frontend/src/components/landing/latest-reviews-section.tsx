import { ReviewCard } from "@/components/reviews/review-card";
import { SecondaryButtonLink } from "@/components/ui/action-button";
import {
  SectionEmptyState,
  SectionErrorState,
} from "@/components/ui/section-state";
import { getLatestReviews } from "@/lib/api";

export async function LatestReviewsSection() {
  const connection = await getLatestReviews(4);

  if (!connection.online) {
    return (
      <section
        className="mt-8 pb-10"
        aria-label="Latest reviews error"
      >
        <SectionErrorState
          title="Latest reviews are temporarily unavailable"
          description="The community activity could not be loaded. Please try again."
        />
      </section>
    );
  }

  const hasReviews = connection.reviews.length > 0;

  return (
    <section
      className="mt-8 pb-10"
      aria-labelledby="latest-reviews-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="latest-reviews-heading"
          className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl"
        >
          Latest reviews
        </h2>
        <SecondaryButtonLink
          href={hasReviews ? "/reviews" : "/movies"}
          className="shrink-0"
        >
          {hasReviews ? "Browse all" : "Browse movies"}
        </SecondaryButtonLink>
      </div>

      {hasReviews ? (
        <div className="mt-3 grid gap-2 min-[36rem]:grid-cols-2 xl:grid-cols-4">
          {connection.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="mt-3">
          <SectionEmptyState
            title="No reviews yet"
            description="Be the first to share your thoughts on a released movie."
          />
        </div>
      )}
    </section>
  );
}
