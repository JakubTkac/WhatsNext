"use client";

import { useActionState } from "react";
import { toggleWatchlistAction } from "@/app/actions/watchlist";
import {
  PrimaryButton,
  PrimaryButtonLink,
  SecondaryButton,
} from "@/components/ui/action-button";
import {
  ErrorToast,
  SuccessToast,
} from "@/components/ui/feedback-toast";
import { createAuthHref } from "@/lib/return-to";
import type { WatchlistFormState } from "@/lib/watchlist-form";

type MovieWatchlistActionProps =
  | {
      state: "unauthenticated";
      returnTo: string;
    }
  | {
      state: "unavailable";
    }
  | {
      state: "available";
      movieSlug: string;
      returnTo: string;
      initiallySaved: boolean;
    };

export function MovieWatchlistAction(props: MovieWatchlistActionProps) {
  if (props.state === "unauthenticated") {
    return (
      <PrimaryButtonLink
        href={createAuthHref("/login", props.returnTo)}
        className="min-h-10 px-3 py-2"
      >
        Add to watchlist
      </PrimaryButtonLink>
    );
  }

  if (props.state === "unavailable") {
    return (
      <SecondaryButton
        disabled
        className="min-h-10 px-3 py-2"
        title="The watchlist service is temporarily unavailable."
      >
        Watchlist unavailable
      </SecondaryButton>
    );
  }

  return (
    <WatchlistToggleAction
      movieSlug={props.movieSlug}
      returnTo={props.returnTo}
      initiallySaved={props.initiallySaved}
    />
  );
}

function WatchlistToggleAction({
  movieSlug,
  returnTo,
  initiallySaved,
}: {
  movieSlug: string;
  returnTo: string;
  initiallySaved: boolean;
}) {
  const initialState: WatchlistFormState = {
    successRevision: 0,
    saved: initiallySaved,
  };
  const [state, formAction, pending] = useActionState(
    toggleWatchlistAction,
    initialState,
  );
  const label = getButtonLabel(state.saved, pending);

  return (
    <form action={formAction}>
      <input type="hidden" name="movieSlug" value={movieSlug} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input
        type="hidden"
        name="intent"
        value={state.saved ? "remove" : "add"}
      />

      {state.formError && !pending ? (
        <ErrorToast message={state.formError} />
      ) : null}
      {state.successMessage ? (
        <SuccessToast
          key={state.successRevision}
          message={state.successMessage}
        />
      ) : null}

      {state.saved ? (
        <SecondaryButton
          type="submit"
          disabled={pending}
          className="min-h-10 px-3 py-2 disabled:cursor-wait"
        >
          {label}
        </SecondaryButton>
      ) : (
        <PrimaryButton
          type="submit"
          disabled={pending}
          className="min-h-10 px-3 py-2 disabled:cursor-wait"
        >
          {label}
        </PrimaryButton>
      )}
    </form>
  );
}

function getButtonLabel(saved: boolean, pending: boolean): string {
  if (pending) {
    return saved ? "Removing..." : "Adding...";
  }

  return saved ? "Remove from watchlist" : "Add to watchlist";
}
