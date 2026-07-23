import { ReviewCard } from "@/components/reviews/review-card";
import { SecondaryButtonLink } from "@/components/ui/action-button";
import { SectionErrorState } from "@/components/ui/section-state";
import { getLatestReviews } from "@/lib/api";

export async function LatestReviewsSection() {
  const connection = await getLatestReviews(3);

  if (!connection.online) {
    return (
      <section className="mt-20" aria-label="Latest reviews error">
        <SectionErrorState
          title="Latest reviews are temporarily unavailable"
          description="The community activity could not be loaded. Please try again."
        />
      </section>
    );
  }

  if (connection.reviews.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-20"
      aria-labelledby="latest-reviews-heading"
    >
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <h2
          id="latest-reviews-heading"
          className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl"
        >
          Latest reviews
        </h2>
        <SecondaryButtonLink href="/reviews" className="shrink-0">
          Browse all
        </SecondaryButtonLink>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {connection.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
