"use client";

import {
  type FormEvent,
  useState,
  useTransition,
} from "react";
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
  const [saved, setSaved] = useState(initiallySaved);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();
  const label = getButtonLabel(saved, pending);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const shouldSave = !saved;

    startTransition(async () => {
      setFeedback(null);

      let response: Response;

      try {
        response = await fetch(
          `/api/watchlist/${encodeURIComponent(movieSlug)}`,
          { method: shouldSave ? "PUT" : "DELETE" },
        );
      } catch {
        setFeedback({
          id: Date.now(),
          type: "error",
          message:
            "The watchlist service is unavailable. Please try again.",
        });
        return;
      }

      if (response.status === 401 || response.status === 403) {
        window.location.assign(createAuthHref("/login", returnTo));
        return;
      }

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        setFeedback({
          id: Date.now(),
          type: "error",
          message: readApiError(
            payload,
            "We could not update your watchlist.",
          ),
        });
        return;
      }

      setSaved(shouldSave);
      setFeedback({
        id: Date.now(),
        type: "success",
        message: shouldSave
          ? "Movie added to your watchlist."
          : "Movie removed from your watchlist.",
      });
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {feedback?.type === "error" ? (
        <ErrorToast key={feedback.id} message={feedback.message} />
      ) : null}
      {feedback?.type === "success" ? (
        <SuccessToast key={feedback.id} message={feedback.message} />
      ) : null}

      {saved ? (
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

type Feedback = {
  id: number;
  type: "error" | "success";
  message: string;
};

function readApiError(value: unknown, fallback: string): string {
  if (!isRecord(value)) {
    return fallback;
  }

  return typeof value.message === "string"
    ? value.message.slice(0, 240)
    : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
