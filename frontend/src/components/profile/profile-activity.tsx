import Link from "next/link";
import type { ReactNode } from "react";
import { UpcomingMovieCarousel } from "@/components/movies/upcoming-movie-carousel";
import { ReviewCard } from "@/components/reviews/review-card";
import {
  SecondaryButton,
  SecondaryButtonLink,
} from "@/components/ui/action-button";
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
        <SecondaryButton
          disabled
          title="The full watchlist page is coming next."
        >
          View watchlist ({total})
        </SecondaryButton>
      </ActivitySectionHeading>

      {items.length === 0 ? (
        <EmptyActivity message="You have no upcoming releases in your watchlist." />
      ) : (
        <UpcomingMovieCarousel movies={items.map((item) => item.movie)} />
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
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/reviews?edit=${encodeURIComponent(review.id)}#review-${review.id}`}
              aria-label={`Edit your review of ${review.movie.title}`}
              className="block rounded-2xl transition-transform duration-150 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <ReviewCard review={{ ...review, author }} />
            </Link>
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
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h2
          id={id}
          className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyActivity({ message }: { message: string }) {
  return (
    <div className="mt-6 border-y border-border py-8 text-sm leading-6 text-muted">
      {message}
    </div>
  );
}
