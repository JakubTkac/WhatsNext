"use client";

import Form from "next/form";
import type {
  FormEvent,
  MouseEvent,
} from "react";
import type { ReviewsQuery } from "@/lib/api";
import {
  PrimaryButton,
  SecondaryButtonLink,
} from "@/components/ui/action-button";
import { useListingNavigation } from "@/components/ui/listing-navigation";
import { useDebouncedFormSubmit } from "@/hooks/use-debounced-form-submit";

const fieldClassName = "dense-field";

const publicFilterParameters = {
  movie: "movie",
  rating: "rating",
  ariaLabel: "Filter community reviews",
} as const;

const ownedFilterParameters = {
  movie: "myMovie",
  rating: "myRating",
  ariaLabel: "Filter your reviews",
  hash: "your-reviews-heading",
} as const;

type ReviewFilterParameters =
  | typeof publicFilterParameters
  | typeof ownedFilterParameters;

type ReviewFilterProps = {
  query: ReviewsQuery;
  preservedQuery: Record<string, string | number | undefined>;
};

export function PublicReviewFilters(props: ReviewFilterProps) {
  return (
    <ReviewFiltersForm
      {...props}
      parameters={publicFilterParameters}
    />
  );
}

export function OwnedReviewFilters(props: ReviewFilterProps) {
  return (
    <ReviewFiltersForm
      {...props}
      parameters={ownedFilterParameters}
    />
  );
}

function ReviewFiltersForm({
  query,
  preservedQuery,
  parameters,
}: ReviewFilterProps & {
  parameters: ReviewFilterParameters;
}) {
  const {
    formRef,
    scheduleSubmit,
    cancelScheduledSubmit,
  } = useDebouncedFormSubmit();
  const navigation = useListingNavigation();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    cancelScheduledSubmit();

    if (!navigation) {
      return;
    }

    event.preventDefault();
    navigation.navigate(
      createReviewsHref(
        new FormData(event.currentTarget),
        parameters,
        preservedQuery,
      ),
    );
  };

  const reset = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      !navigation ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    cancelScheduledSubmit();
    navigation.navigate(
      createResetHref(parameters, preservedQuery),
    );
  };

  return (
    <Form
      ref={formRef}
      action="/reviews"
      onChange={scheduleSubmit}
      onSubmit={submit}
      className="mt-4 grid gap-2 min-[36rem]:grid-cols-[minmax(12rem,1fr)_9rem_auto] min-[36rem]:items-end"
      aria-label={parameters.ariaLabel}
      aria-busy={navigation?.pending}
    >
      {Object.entries(preservedQuery).map(([name, value]) =>
        value !== undefined && value !== "" ? (
          <input
            key={name}
            type="hidden"
            name={name}
            value={String(value)}
          />
        ) : null,
      )}

      <label className="block">
        <span className="dense-label">Movie</span>
        <input
          name={parameters.movie}
          type="search"
          defaultValue={query.movie}
          maxLength={80}
          placeholder="Search by movie title"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="dense-label">Rating</span>
        <select
          name={parameters.rating}
          defaultValue={query.rating ? String(query.rating) : ""}
          className={fieldClassName}
        >
          <option value="">All ratings</option>
          {Array.from({ length: 10 }, (_, index) => 10 - index).map(
            (rating) => (
              <option key={rating} value={rating}>
                {rating}/10
              </option>
            ),
          )}
        </select>
      </label>

      <div className="flex gap-1.5">
        <PrimaryButton
          type="submit"
          disabled={navigation?.pending}
          className="flex-1 min-[36rem]:flex-none"
        >
          {navigation?.pending ? "Loading..." : "Apply"}
        </PrimaryButton>
        <SecondaryButtonLink
          href={createResetHref(parameters, preservedQuery)}
          onClick={reset}
          className="flex-1 min-[36rem]:flex-none"
        >
          Reset
        </SecondaryButtonLink>
      </div>
    </Form>
  );
}

function createReviewsHref(
  formData: FormData,
  parameters: ReviewFilterParameters,
  preservedQuery: Record<string, string | number | undefined>,
): string {
  const searchParams = createSearchParams(preservedQuery);
  const movie = readFormString(formData, parameters.movie).trim();
  const rating = readFormString(formData, parameters.rating);

  if (movie) {
    searchParams.set(parameters.movie, movie);
  }

  if (rating) {
    searchParams.set(parameters.rating, rating);
  }

  return createReviewsPath(searchParams, parameters);
}

function createResetHref(
  parameters: ReviewFilterParameters,
  preservedQuery: Record<string, string | number | undefined>,
): string {
  return createReviewsPath(
    createSearchParams(preservedQuery),
    parameters,
  );
}

function createSearchParams(
  query: Record<string, string | number | undefined>,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      searchParams.set(name, String(value));
    }
  }

  return searchParams;
}

function createReviewsPath(
  searchParams: URLSearchParams,
  parameters: ReviewFilterParameters,
): string {
  const search = searchParams.toString();
  const hash = "hash" in parameters ? `#${parameters.hash}` : "";
  return search ? `/reviews?${search}${hash}` : `/reviews${hash}`;
}

function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
