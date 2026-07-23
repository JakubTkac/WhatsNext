"use client";

import { useActionState } from "react";
import { deleteReviewAction } from "@/app/actions/reviews";
import {
  DangerButton,
  SecondaryButton,
} from "@/components/ui/action-button";
import {
  ErrorToast,
  SuccessToast,
} from "@/components/ui/feedback-toast";
import { Modal } from "@/components/ui/modal";
import type { LatestReview } from "@/lib/api";
import type { ReviewFormState } from "@/lib/review-form";

const initialState: ReviewFormState = { successRevision: 0 };

export function DeleteReviewModal({
  review,
  onClose,
}: {
  review: LatestReview;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    deleteReviewAction,
    initialState,
  );
  const handleClose = () => {
    if (!pending) {
      onClose();
    }
  };

  return (
    <Modal title="Delete review" onClose={handleClose}>
      <form action={formAction} className="p-5 sm:p-6">
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
        <p className="text-base leading-7 text-muted">
          Are you sure you want to delete your review of{" "}
          <span className="font-semibold text-foreground">
            &ldquo;{review.movie.title}&rdquo;
          </span>?
        </p>
        <p className="mt-2 text-sm text-subtle">
          This action cannot be undone.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SecondaryButton
            onClick={handleClose}
            disabled={pending}
            autoFocus
            className="min-h-12 w-full disabled:cursor-wait"
          >
            Go back
          </SecondaryButton>
          <DangerButton
            type="submit"
            disabled={pending}
            className="min-h-12 w-full disabled:cursor-wait"
          >
            {pending ? "Deleting..." : "Delete review"}
          </DangerButton>
        </div>
      </form>
    </Modal>
  );
}
