"use client";

import { useActionState, useState } from "react";
import { createReviewAction } from "@/app/actions/reviews";
import {
  PrimaryButton,
  PrimaryButtonLink,
  SecondaryButton,
  SecondaryButtonLink,
} from "@/components/ui/action-button";
import {
  ErrorToast,
  SuccessToast,
} from "@/components/ui/feedback-toast";
import { createAuthHref } from "@/lib/return-to";
import type { ReviewFormState } from "@/lib/review-form";

const initialState: ReviewFormState = { successRevision: 0 };
const fieldClassName =
  "mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]";

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
      reviewId: string;
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
    return (
      <SecondaryButtonLink
        href={`/reviews?edit=${encodeURIComponent(props.reviewId)}#review-${props.reviewId}`}
      >
        Edit your review
      </SecondaryButtonLink>
    );
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
    <div className="w-full border-t border-border pt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-[-0.035em]">
            Write your review
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            Rate the movie from 1 to 10 and share what you thought.
          </p>
        </div>
        <SecondaryButton
          onClick={() => setOpen(false)}
          className="min-h-10 px-3 py-2"
        >
          Cancel
        </SecondaryButton>
      </div>

      <CreateMovieReviewForm movieSlug={movieSlug} />
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
      className="mt-6"
    >
      <input type="hidden" name="movieSlug" value={movieSlug} />

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

        <label>
          <span className="text-sm font-semibold">Review</span>
          <textarea
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="What worked, what did not, and who would you recommend it to?"
            aria-invalid={state.fieldErrors?.body ? true : undefined}
            className={`${fieldClassName} resize-y leading-6`}
          />
          <FieldError message={state.fieldErrors?.body} />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <PrimaryButton
          type="submit"
          disabled={pending}
          className="disabled:cursor-wait"
        >
          {pending ? "Publishing..." : "Publish review"}
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
