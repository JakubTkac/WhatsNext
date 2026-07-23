"use client";

import { useActionState, useEffect, useState } from "react";
import { updateReviewAction } from "@/app/actions/reviews";
import { PrimaryButton } from "@/components/ui/action-button";
import {
  ErrorToast,
  SuccessToast,
} from "@/components/ui/feedback-toast";
import type { LatestReview } from "@/lib/api";
import type { ReviewFormState } from "@/lib/review-form";

const initialState: ReviewFormState = { successRevision: 0 };
const fieldClassName =
  "mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]";

export function EditReviewForm({
  review,
  className = "mt-5 border-t border-border pt-5",
  onDirtyChange,
}: {
  review: LatestReview;
  className?: string;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [rating, setRating] = useState(String(review.rating));
  const [body, setBody] = useState(review.body);
  const [state, formAction, pending] = useActionState(
    updateReviewAction,
    initialState,
  );
  const hasChanges =
    rating !== String(review.rating) ||
    body.trim() !== review.body.trim();

  useEffect(() => {
    setRating(String(review.rating));
    setBody(review.body);
  }, [review.rating, review.body]);

  useEffect(() => {
    onDirtyChange?.(hasChanges);
  }, [hasChanges, onDirtyChange]);

  useEffect(() => {
    if (state.successRevision > 0) {
      onDirtyChange?.(false);
    }
  }, [onDirtyChange, state.successRevision]);

  return (
    <form
      key={state.successRevision}
      action={formAction}
      noValidate
      onReset={(event) => event.preventDefault()}
      className={className}
    >
      <input type="hidden" name="reviewId" value={review.id} />
      <input type="hidden" name="movieSlug" value={review.movie.slug} />
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
          disabled={pending || !hasChanges}
          className={
            pending
              ? "disabled:cursor-wait"
              : "disabled:cursor-not-allowed"
          }
        >
          {pending ? "Saving..." : "Save review"}
        </PrimaryButton>
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
