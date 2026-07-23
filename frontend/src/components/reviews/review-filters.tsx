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

const fieldClassName =
  "min-h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]";

export function ReviewFilters({ query }: { query: ReviewsQuery }) {
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
    navigation.navigate(createReviewsHref(new FormData(event.currentTarget)));
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
    navigation.navigate("/reviews");
  };

  return (
    <Form
      ref={formRef}
      action="/reviews"
      onChange={scheduleSubmit}
      onSubmit={submit}
      className="mt-8 grid gap-4 sm:grid-cols-[minmax(14rem,1fr)_12rem_auto] sm:items-end"
      aria-busy={navigation?.pending}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Movie</span>
        <input
          name="movie"
          type="search"
          defaultValue={query.movie}
          maxLength={80}
          placeholder="Search by movie title"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Rating</span>
        <select
          name="rating"
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

      <div className="flex gap-2">
        <PrimaryButton
          type="submit"
          disabled={navigation?.pending}
          className="flex-1 sm:flex-none"
        >
          {navigation?.pending ? "Loading..." : "Apply"}
        </PrimaryButton>
        <SecondaryButtonLink
          href="/reviews"
          onClick={reset}
          className="flex-1 sm:flex-none"
        >
          Reset
        </SecondaryButtonLink>
      </div>
    </Form>
  );
}

function createReviewsHref(formData: FormData): string {
  const searchParams = new URLSearchParams();
  const movie = readFormString(formData, "movie").trim();
  const rating = readFormString(formData, "rating");

  if (movie) {
    searchParams.set("movie", movie);
  }

  if (rating) {
    searchParams.set("rating", rating);
  }

  const search = searchParams.toString();
  return search ? `/reviews?${search}` : "/reviews";
}

function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
