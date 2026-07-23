import type { ReactNode } from "react";
import { UpcomingMovieCarousel } from "@/components/movies/upcoming-movie-carousel";
import { ReviewCard } from "@/components/reviews/review-card";
import { SecondaryButtonLink } from "@/components/ui/action-button";
import type {
  ProfileReview,
  ProfileWatchlistItem,
} from "@/lib/profile";

export function WatchlistPreview({
  items,
  total,
}: {
  items: ProfileWatchlistItem[];
  total: number;
}) {
  return (
    <section aria-labelledby="upcoming-watchlist-heading">
      <ActivitySectionHeading
        id="upcoming-watchlist-heading"
        title="Your upcoming movies"
        description="The next releases saved in your watchlist."
      >
        <SecondaryButtonLink href="/watchlist">
          View watchlist ({total})
        </SecondaryButtonLink>
      </ActivitySectionHeading>

      {items.length === 0 ? (
        <EmptyActivity message="You have no upcoming releases in your watchlist." />
      ) : (
        <UpcomingMovieCarousel
          movies={items.map((item) => item.movie)}
          extendedDescription={false}
        />
      )}
    </section>
  );
}

export function ReviewsPreview({
  author,
  reviews,
  total,
}: {
  author: {
    displayName: string;
    avatarUrl: string | null;
  };
  reviews: ProfileReview[];
  total: number;
}) {
  return (
    <section aria-labelledby="profile-reviews-heading">
      <ActivitySectionHeading
        id="profile-reviews-heading"
        title="Your recent reviews"
        description="Open a review to update its rating or text."
      >
        <SecondaryButtonLink href="/reviews#your-reviews-heading">
          View all reviews ({total})
        </SecondaryButtonLink>
      </ActivitySectionHeading>

      {reviews.length === 0 ? (
        <EmptyActivity message="You have not reviewed a movie yet. Your latest reviews will appear here." />
      ) : (
        <div className="mt-3 grid gap-2.5 min-[36rem]:grid-cols-2 xl:grid-cols-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={{ ...review, author }}
              primaryAction={{
                href: `/reviews?edit=${encodeURIComponent(review.id)}#review-${review.id}`,
                label: `Edit your review of ${review.movie.title}`,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ActivitySectionHeading({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-2 min-[36rem]:flex-row min-[36rem]:items-end">
      <div>
        <h2
          id={id}
          className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl"
        >
          {title}
        </h2>
        <p className="mt-0.5 text-xs leading-4 text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyActivity({ message }: { message: string }) {
  return (
    <div className="mt-3 border-y border-border py-3 text-xs leading-5 text-muted">
      {message}
    </div>
  );
}
