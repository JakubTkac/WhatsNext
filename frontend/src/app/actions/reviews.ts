"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import type {
  ReviewFieldErrors,
  ReviewFormState,
} from "@/lib/review-form";

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";

export async function createReviewAction(
  previousState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const movieSlug = readString(formData, "movieSlug").trim().toLowerCase();
  const rating = Number(readString(formData, "rating"));
  const body = readString(formData, "body").trim();
  const fieldErrors = validateReview(movieSlug, rating, body, true);

  if (hasErrors(fieldErrors)) {
    return { successRevision: previousState.successRevision, fieldErrors };
  }

  const result = await sendReviewRequest("/reviews", "POST", {
    movieSlug,
    rating,
    body,
  });

  if ("error" in result) {
    return {
      successRevision: previousState.successRevision,
      formError: result.error,
    };
  }

  revalidateReviewViews(movieSlug);
  redirect(
    createReviewFeedbackHref(
      `/movies/${encodeURIComponent(movieSlug)}`,
      "review-published",
    ),
  );
}

export async function updateReviewAction(
  previousState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const reviewId = readString(formData, "reviewId");
  const movieSlug = normalizeMovieSlug(
    readString(formData, "movieSlug"),
  );
  const rating = Number(readString(formData, "rating"));
  const body = readString(formData, "body").trim();
  const fieldErrors = validateReview("", rating, body, false);

  if (!isUuid(reviewId)) {
    return {
      successRevision: previousState.successRevision,
      formError: "The selected review is invalid.",
    };
  }

  if (hasErrors(fieldErrors)) {
    return { successRevision: previousState.successRevision, fieldErrors };
  }

  const result = await sendReviewRequest(`/reviews/${reviewId}`, "PATCH", {
    rating,
    body,
  });

  if ("error" in result) {
    return {
      successRevision: previousState.successRevision,
      formError: result.error,
    };
  }

  revalidateReviewViews(movieSlug);
  return {
    successRevision: previousState.successRevision + 1,
    successMessage: "Review updated.",
  };
}

export async function deleteReviewAction(
  previousState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const reviewId = readString(formData, "reviewId");
  const movieSlug = normalizeMovieSlug(
    readString(formData, "movieSlug"),
  );
  const returnTo = normalizeReviewReturnTo(
    readString(formData, "returnTo"),
    movieSlug
      ? `/movies/${encodeURIComponent(movieSlug)}`
      : "/reviews",
  );

  if (!isUuid(reviewId)) {
    return {
      successRevision: previousState.successRevision,
      formError: "The selected review is invalid.",
    };
  }

  const result = await sendReviewRequest(
    `/reviews/${reviewId}`,
    "DELETE",
  );

  if ("error" in result) {
    return {
      successRevision: previousState.successRevision,
      formError: result.error,
    };
  }

  revalidateReviewViews(movieSlug);
  redirect(createReviewFeedbackHref(returnTo, "review-deleted"));
}

async function sendReviewRequest(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: Record<string, string | number>,
): Promise<{ ok: true } | { error: string }> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { error: "Your session has expired. Please log in again." };
  }

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (response.status === 401 || response.status === 403) {
      return { error: "Your session has expired. Please log in again." };
    }

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      return {
        error: readApiError(
          payload,
          method === "DELETE"
            ? "We could not delete your review."
            : "We could not save your review.",
        ),
      };
    }

    return { ok: true };
  } catch {
    return {
      error: "The review service is unavailable. Please try again.",
    };
  }
}

function validateReview(
  movieSlug: string,
  rating: number,
  body: string,
  validateMovie: boolean,
): ReviewFieldErrors {
  const errors: ReviewFieldErrors = {};

  if (validateMovie && (!movieSlug || movieSlug.length > 255)) {
    errors.movieSlug = "Choose a movie to review.";
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    errors.rating = "Choose a rating from 1 to 10.";
  }

  if (body.length < 10 || body.length > 2000) {
    errors.body = "Review must contain 10 to 2000 characters.";
  }

  return errors;
}

function revalidateReviewViews(movieSlug?: string): void {
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/profile");

  if (movieSlug) {
    revalidatePath(`/movies/${movieSlug}`);
  }
}

function hasErrors(errors: ReviewFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeMovieSlug(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)
    ? normalized
    : undefined;
}

function normalizeReviewReturnTo(value: string, fallback: string): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\r\n]/.test(value)
  ) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://whatsnext.local");

    if (url.origin !== "https://whatsnext.local") {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

function createReviewFeedbackHref(
  returnTo: string,
  feedback: "review-published" | "review-deleted",
): string {
  const url = new URL(returnTo, "https://whatsnext.local");
  url.searchParams.set("feedback", feedback);
  url.searchParams.set("feedbackRevision", String(Date.now()));
  return `${url.pathname}${url.search}${url.hash}`;
}

function readApiError(value: unknown, fallback: string): string {
  if (!isRecord(value)) {
    return fallback;
  }

  if (typeof value.message === "string") {
    return value.message.slice(0, 240);
  }

  if (Array.isArray(value.message)) {
    return value.message
      .filter((message): message is string => typeof message === "string")
      .join(" ")
      .slice(0, 240);
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
