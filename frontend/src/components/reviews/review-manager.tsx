"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  deleteReviewAction,
  updateReviewAction,
} from "@/app/actions/reviews";
import {
  DangerButton,
  PrimaryButton,
  PrimaryButtonLink,
  SecondaryButton,
} from "@/components/ui/action-button";
import {
  ErrorToast,
  SuccessToast,
} from "@/components/ui/feedback-toast";
import { Pagination } from "@/components/ui/pagination";
import { SectionErrorState } from "@/components/ui/section-state";
import type {
  LatestReview,
  ReviewWorkspaceConnection,
} from "@/lib/api";
import type { ReviewFormState } from "@/lib/review-form";
import { createAuthHref } from "@/lib/return-to";

const initialState: ReviewFormState = { successRevision: 0 };
const fieldClassName =
  "mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]";

export function ReviewManager({
  connection,
  initialEditReviewId,
  paginationQuery,
}: {
  connection: ReviewWorkspaceConnection;
  initialEditReviewId?: string;
  paginationQuery: Record<string, string | number | undefined>;
}) {
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

  return (
    <section className="mt-20" aria-labelledby="your-reviews-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="your-reviews-heading"
          className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl"
        >
          Your reviews
        </h2>
        <p className="text-sm text-muted">
          {connection.meta.totalItems}{" "}
          {connection.meta.totalItems === 1 ? "review" : "reviews"}
        </p>
      </div>

      <OwnedReviews
        reviews={connection.reviews}
        initialEditReviewId={initialEditReviewId}
      />

      <Pagination
        currentPage={connection.meta.page}
        totalPages={connection.meta.totalPages}
        pathname="/reviews"
        query={paginationQuery}
        pageParameter="myPage"
        hash="your-reviews-heading"
      />
    </section>
  );
}

function OwnedReviews({
  reviews,
  initialEditReviewId,
}: {
  reviews: LatestReview[];
  initialEditReviewId?: string;
}) {
  if (reviews.length === 0) {
    return (
      <div className="mt-8 border-y border-border py-8">
        <p className="text-sm leading-6 text-muted">
          You have not reviewed a movie yet.
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
    <article id={`review-${review.id}`} className="scroll-mt-28 py-6">
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
              setConfirmingDelete((current) => !current);
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
        <DeleteReviewForm
          review={review}
          onCancel={() => setConfirmingDelete(false)}
        />
      ) : null}
    </article>
  );
}

function EditReviewForm({ review }: { review: LatestReview }) {
  const [rating, setRating] = useState(String(review.rating));
  const [body, setBody] = useState(review.body);
  const [state, formAction, pending] = useActionState(
    updateReviewAction,
    initialState,
  );

  useEffect(() => {
    setRating(String(review.rating));
    setBody(review.body);
  }, [review.rating, review.body]);

  return (
    <form
      key={state.successRevision}
      action={formAction}
      noValidate
      onReset={(event) => event.preventDefault()}
      className="mt-5 border-t border-border pt-5"
    >
      <input type="hidden" name="reviewId" value={review.id} />
      {state.formError && !pending ? (
        <ErrorToast message={state.formError} />
      ) : null}
      {state.successMessage ? (
        <SuccessToast
          key={state.successRevision}
          message={state.successMessage}
        />
      ) : null}

      <div className="grid gap-5">
        <label className="max-w-40">
          <span className="text-sm font-semibold">Your rating</span>
          <select
            name="rating"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            aria-invalid={state.fieldErrors?.rating ? true : undefined}
            className={fieldClassName}
          >
            {Array.from({ length: 10 }, (_, index) => 10 - index).map(
              (value) => (
                <option key={value} value={value}>
                  {value}/10
                </option>
              ),
            )}
          </select>
          <FieldError message={state.fieldErrors?.rating} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Review</span>
          <textarea
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            maxLength={2000}
            aria-invalid={state.fieldErrors?.body ? true : undefined}
            className={`${fieldClassName} resize-y leading-6`}
          />
          <FieldError message={state.fieldErrors?.body} />
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <PrimaryButton
          type="submit"
          disabled={pending}
          className="disabled:cursor-wait"
        >
          {pending ? "Saving..." : "Save review"}
        </PrimaryButton>
      </div>
    </form>
  );
}

function DeleteReviewForm({
  review,
  onCancel,
}: {
  review: LatestReview;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    deleteReviewAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-5 border-t border-red-200 pt-5"
    >
      <input type="hidden" name="reviewId" value={review.id} />
      {state.formError && !pending ? (
        <ErrorToast message={state.formError} />
      ) : null}
      {state.successMessage ? (
        <SuccessToast
          key={state.successRevision}
          message={state.successMessage}
        />
      ) : null}
      <p className="text-sm font-semibold text-danger">
        Delete your review of {review.movie.title}?
      </p>
      <p className="mt-1 text-sm text-muted">This cannot be undone.</p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <SecondaryButton onClick={onCancel} disabled={pending}>
          Cancel
        </SecondaryButton>
        <DangerButton
          type="submit"
          disabled={pending}
          className="disabled:cursor-wait"
        >
          {pending ? "Deleting..." : "Delete review"}
        </DangerButton>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-2 text-sm text-danger">
      {message}
    </p>
  ) : null;
}
