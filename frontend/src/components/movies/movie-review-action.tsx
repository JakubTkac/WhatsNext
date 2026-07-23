"use client";

import { useActionState, useState, type ReactNode } from "react";
import { createReviewAction } from "@/app/actions/reviews";
import { DeleteReviewModal } from "@/components/reviews/delete-review-modal";
import { EditReviewForm } from "@/components/reviews/edit-review-form";
import {
  DangerButton,
  PrimaryButton,
  PrimaryButtonLink,
  SecondaryButton,
} from "@/components/ui/action-button";
import {
  ErrorToast,
} from "@/components/ui/feedback-toast";
import type { LatestReview } from "@/lib/api";
import { createAuthHref } from "@/lib/return-to";
import type { ReviewFormState } from "@/lib/review-form";

const initialState: ReviewFormState = { successRevision: 0 };
const fieldClassName = "dense-field mt-1";

type MovieReviewActionProps =
  | {
      state: "unreleased";
      releaseLabel: string;
    }
  | {
      state: "unauthenticated";
      returnTo: string;
    }
  | {
      state: "unavailable";
    }
  | {
      state: "reviewed";
      review: LatestReview;
    }
  | {
      state: "available";
      movieSlug: string;
    };

export function MovieReviewAction(props: MovieReviewActionProps) {
  if (props.state === "unreleased") {
    return (
      <SecondaryButton
        disabled
        title={`Reviews open on ${props.releaseLabel}.`}
      >
        Reviews open {props.releaseLabel}
      </SecondaryButton>
    );
  }

  if (props.state === "unauthenticated") {
    return (
      <PrimaryButtonLink
        href={createAuthHref("/login", props.returnTo)}
      >
        Write a review
      </PrimaryButtonLink>
    );
  }

  if (props.state === "unavailable") {
    return (
      <SecondaryButton
        disabled
        title="Your review tools are temporarily unavailable."
      >
        Review tools unavailable
      </SecondaryButton>
    );
  }

  if (props.state === "reviewed") {
    return <MovieOwnedReviewActions review={props.review} />;
  }

  return <MovieReviewComposer movieSlug={props.movieSlug} />;
}

function MovieReviewComposer({ movieSlug }: { movieSlug: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <PrimaryButton onClick={() => setOpen(true)}>
        Write a review
      </PrimaryButton>
    );
  }

  return (
    <MovieReviewPanel
      title="Write your review"
      description="Rate the movie from 1 to 10 and share what you thought."
      onCancel={() => setOpen(false)}
    >
      <CreateMovieReviewForm movieSlug={movieSlug} />
    </MovieReviewPanel>
  );
}

function MovieOwnedReviewActions({ review }: { review: LatestReview }) {
  const [mode, setMode] = useState<"idle" | "editing" | "deleting">(
    "idle",
  );

  if (mode === "editing") {
    return (
      <MovieReviewPanel
        title="Edit your review"
        description={`Update your rating or thoughts on ${review.movie.title}.`}
        onCancel={() => setMode("idle")}
      >
        <EditReviewForm review={review} className="mt-3" />
      </MovieReviewPanel>
    );
  }

  if (mode === "deleting") {
    return (
      <DeleteReviewModal
        review={review}
        returnTo={`/movies/${review.movie.slug}`}
        onClose={() => setMode("idle")}
      />
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <SecondaryButton onClick={() => setMode("editing")}>
        Edit your review
      </SecondaryButton>
      <DangerButton onClick={() => setMode("deleting")}>
        Delete review
      </DangerButton>
    </div>
  );
}

function MovieReviewPanel({
  title,
  description,
  onCancel,
  children,
}: {
  title: string;
  description: string;
  onCancel: () => void;
  children: ReactNode;
}) {
  return (
    <div className="w-full rounded-xl border border-border bg-secondary/45 p-2.5 sm:p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-[-0.025em]">
            {title}
          </h3>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            {description}
          </p>
        </div>
        <SecondaryButton
          onClick={onCancel}
          className="min-h-8 px-2.5 py-1"
        >
          Cancel
        </SecondaryButton>
      </div>

      {children}
    </div>
  );
}

function CreateMovieReviewForm({ movieSlug }: { movieSlug: string }) {
  const [rating, setRating] = useState("8");
  const [body, setBody] = useState("");
  const [state, formAction, pending] = useActionState(
    createReviewAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      noValidate
      onReset={(event) => event.preventDefault()}
      className="mt-2.5"
    >
      <input type="hidden" name="movieSlug" value={movieSlug} />

      {state.formError && !pending ? (
        <ErrorToast message={state.formError} />
      ) : null}

      <div className="grid gap-2.5 md:grid-cols-[8rem_minmax(0,1fr)_auto] md:items-end">
        <label>
          <span className="dense-label mb-0">Your rating</span>
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

        <label>
          <span className="dense-label mb-0">Review</span>
          <textarea
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="What worked, what did not, and who would you recommend it to?"
            aria-invalid={state.fieldErrors?.body ? true : undefined}
            className={`${fieldClassName} resize-y leading-5`}
          />
          <FieldError message={state.fieldErrors?.body} />
        </label>
        <PrimaryButton
          type="submit"
          disabled={pending}
          className="w-full disabled:cursor-wait md:w-auto"
        >
          {pending ? "Publishing..." : "Publish review"}
        </PrimaryButton>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-1 text-xs text-danger">
      {message}
    </p>
  ) : null;
}
