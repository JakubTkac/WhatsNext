"use client";

import Form from "next/form";
import type { GenreSummary, MoviesQuery } from "@/lib/api";
import {
  PrimaryButton,
  SecondaryButtonLink,
} from "@/components/ui/action-button";
import { beginFormRouteTransition } from "@/components/ui/route-transition-indicator";
import { useDebouncedFormSubmit } from "@/hooks/use-debounced-form-submit";

type MovieFiltersProps = {
  query: MoviesQuery;
  genres: GenreSummary[];
  pathname: string;
};

const fieldClassName =
  "min-h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]";

export function MovieFilters({
  query,
  genres,
  pathname,
}: MovieFiltersProps) {
  const {
    formRef,
    scheduleSubmit,
    cancelScheduledSubmit,
  } = useDebouncedFormSubmit();

  return (
    <Form
      ref={formRef}
      action={pathname}
      onChange={scheduleSubmit}
      onSubmit={(event) => {
        cancelScheduledSubmit();
        beginFormRouteTransition(event.currentTarget);
      }}
      className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.4fr)_1fr_1fr_1fr_auto] lg:items-end"
    >
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Title</span>
        <input
          name="search"
          type="search"
          defaultValue={query.search}
          maxLength={80}
          placeholder="Search movies"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Genre</span>
        <select
          name="genre"
          defaultValue={query.genre ?? ""}
          className={fieldClassName}
        >
          <option value="">All genres</option>
          {genres.map((genre) => (
            <option key={genre.slug} value={genre.slug}>
              {genre.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Release</span>
        <select
          name="release"
          defaultValue={query.release}
          className={fieldClassName}
        >
          <option value="all">All releases</option>
          <option value="upcoming">Upcoming</option>
          <option value="released">Released</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Sort</span>
        <select
          name="sort"
          defaultValue={query.sort}
          className={fieldClassName}
        >
          <option value="releaseAsc">Release date: earliest</option>
          <option value="releaseDesc">Release date: latest</option>
          <option value="titleAsc">Title: A–Z</option>
        </select>
      </label>

      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <PrimaryButton type="submit" className="flex-1 lg:flex-none">
          Apply
        </PrimaryButton>
        <SecondaryButtonLink href={pathname} className="flex-1 lg:flex-none">
          Reset
        </SecondaryButtonLink>
      </div>
    </Form>
  );
}
