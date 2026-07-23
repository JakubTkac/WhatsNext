"use client";

import Form from "next/form";
import type { ReviewsQuery } from "@/lib/api";
import {
  PrimaryButton,
  SecondaryButtonLink,
} from "@/components/ui/action-button";

const fieldClassName =
  "min-h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]";

export function ReviewFilters({ query }: { query: ReviewsQuery }) {
  return (
    <Form
      action="/reviews"
      className="mt-8 grid gap-4 sm:grid-cols-[minmax(14rem,1fr)_12rem_auto] sm:items-end"
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
        <PrimaryButton type="submit" className="flex-1 sm:flex-none">
          Apply
        </PrimaryButton>
        <SecondaryButtonLink href="/reviews" className="flex-1 sm:flex-none">
          Reset
        </SecondaryButtonLink>
      </div>
    </Form>
  );
}
