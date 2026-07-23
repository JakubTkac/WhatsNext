"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DeleteReviewModal } from "@/components/reviews/delete-review-modal";
import { EditReviewForm } from "@/components/reviews/edit-review-form";
import { OwnedReviewFilters } from "@/components/reviews/review-filters";
import { OwnedReviewResultsSkeleton } from "@/components/reviews/reviews-page-skeleton";
import {
  DangerButton,
  PrimaryButtonLink,
  SecondaryButton,
} from "@/components/ui/action-button";
import {
  getListingPageItemCount,
  readListingDestinationPage,
  useListingNavigation,
} from "@/components/ui/listing-navigation";
import { Pagination } from "@/components/ui/pagination";
import { SectionErrorState } from "@/components/ui/section-state";
import type {
  LatestReview,
  ReviewsQuery,
  ReviewWorkspaceConnection,
} from "@/lib/api";
import { createAuthHref } from "@/lib/return-to";

export function ReviewManager({
  connection,
  query,
  initialEditReviewId,
  preservedQuery,
}: {
  connection: ReviewWorkspaceConnection;
  query: ReviewsQuery;
  initialEditReviewId?: string;
  preservedQuery: Record<string, string | number | undefined>;
}) {
  const navigation = useListingNavigation();
  const connectionStatus = connection.status;

  useEffect(() => {
    if (connectionStatus !== "online" || !initialEditReviewId) {
      return;
    }

    document
      .getElementById(`review-${initialEditReviewId}`)
      ?.scrollIntoView({ block: "start" });
  }, [connectionStatus, initialEditReviewId]);

  if (connection.status === "unauthenticated") {
    return (
      <section className="mt-20 rounded-2xl border border-border bg-secondary/55 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">
          Write your own review
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Log in to review released movies and manage your existing reviews.
        </p>
        <div className="mt-5">
          <PrimaryButtonLink href={createAuthHref("/login", "/reviews")}>
            Log in
          </PrimaryButtonLink>
        </div>
      </section>
    );
  }

  if (connection.status === "unavailable") {
    return (
      <section className="mt-20" aria-label="Review management error">
        <SectionErrorState
          title="Your review tools are temporarily unavailable"
          description="Public reviews are still available. Try loading your review tools again."
        />
      </section>
    );
  }

  const pending = navigation?.pending === true;
  const displayedPage = pending
    ? readListingDestinationPage(
        navigation?.destination ?? null,
        "myPage",
      )
    : connection.meta.page;
  const skeletonItemCount =
    getListingPageItemCount(
      connection.meta.totalItems,
      connection.meta.limit,
      displayedPage,
    ) || connection.meta.limit;

  return (
    <section
      className="mt-20"
      aria-labelledby="your-reviews-heading"
      aria-busy={pending}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="your-reviews-heading"
          className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl"
        >
          Your reviews
        </h2>
        <div className="text-right">
          <p className="text-sm text-muted">
            {connection.meta.totalItems}{" "}
            {connection.meta.totalItems === 1 ? "review" : "reviews"}
          </p>
          <p className="mt-1 text-sm text-subtle" aria-live="polite">
            Page {displayedPage}
            {connection.meta.totalPages > 0
              ? ` of ${connection.meta.totalPages}`
              : ""}
          </p>
        </div>
      </div>

      <OwnedReviewFilters
        key={`${query.movie ?? ""}-${query.rating ?? ""}`}
        query={query}
        preservedQuery={preservedQuery}
      />

      {pending ? (
        <OwnedReviewResultsSkeleton itemCount={skeletonItemCount} />
      ) : (
        <OwnedReviews
          reviews={connection.reviews}
          initialEditReviewId={initialEditReviewId}
          hasActiveFilters={Boolean(query.movie || query.rating)}
        />
      )}

      <Pagination
        currentPage={displayedPage}
        totalPages={connection.meta.totalPages}
        pathname="/reviews"
        query={{
          ...preservedQuery,
          myMovie: query.movie,
          myRating: query.rating,
        }}
        pageParameter="myPage"
        hash="your-reviews-heading"
        pending={pending}
        onNavigate={navigation?.navigate}
      />
    </section>
  );
}

function OwnedReviews({
  reviews,
  initialEditReviewId,
  hasActiveFilters,
}: {
  reviews: LatestReview[];
  initialEditReviewId?: string;
  hasActiveFilters: boolean;
}) {
  if (reviews.length === 0) {
    return (
      <div className="mt-8 border-y border-border py-8">
        <p className="text-sm leading-6 text-muted">
          {hasActiveFilters
            ? "No reviews match these filters."
            : "You have not reviewed a movie yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 divide-y divide-border border-y border-border">
      {reviews.map((review) => (
        <OwnedReviewRow
          key={review.id}
          review={review}
          initiallyEditing={review.id === initialEditReviewId}
        />
      ))}
    </div>
  );
}

function OwnedReviewRow({
  review,
  initiallyEditing,
}: {
  review: LatestReview;
  initiallyEditing: boolean;
}) {
  const [editing, setEditing] = useState(initiallyEditing);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <article
      id={`review-${review.id}`}
      className="min-h-[8.75rem] scroll-mt-40 py-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            <Link
              href={`/movies/${review.movie.slug}`}
              className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {review.movie.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm font-semibold text-primary">
            {review.rating}/10
          </p>
        </div>
        <div className="flex gap-2">
          <SecondaryButton
            onClick={() => {
              setEditing((current) => !current);
              setConfirmingDelete(false);
            }}
            className="min-h-10 px-3 py-2"
          >
            {editing ? "Cancel edit" : "Edit"}
          </SecondaryButton>
          <DangerButton
            onClick={() => {
              setConfirmingDelete(true);
              setEditing(false);
            }}
            className="min-h-10 px-3 py-2"
          >
            Delete
          </DangerButton>
        </div>
      </div>

      {!editing ? (
        <p className="mt-4 max-w-4xl text-sm leading-6 text-muted">
          {review.body}
        </p>
      ) : null}

      {editing ? <EditReviewForm review={review} /> : null}
      {confirmingDelete ? (
        <DeleteReviewModal
          review={review}
          onClose={() => setConfirmingDelete(false)}
        />
      ) : null}
    </article>
  );
}
