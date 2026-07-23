"use client";

import Form from "next/form";
import type {
  FormEvent,
  MouseEvent,
} from "react";
import type { GenreSummary, MoviesQuery } from "@/lib/api";
import {
  PrimaryButton,
  SecondaryButtonLink,
} from "@/components/ui/action-button";
import { useListingNavigation } from "@/components/ui/listing-navigation";
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
  const navigation = useListingNavigation();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    cancelScheduledSubmit();

    if (!navigation) {
      return;
    }

    event.preventDefault();
    navigation.navigate(
      createMovieFiltersHref(pathname, new FormData(event.currentTarget)),
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
    navigation.navigate(pathname);
  };

  return (
    <Form
      ref={formRef}
      action={pathname}
      onChange={scheduleSubmit}
      onSubmit={submit}
      className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.4fr)_1fr_1fr_1fr_auto] lg:items-end"
      aria-busy={navigation?.pending}
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
        <PrimaryButton
          type="submit"
          disabled={navigation?.pending}
          className="flex-1 lg:flex-none"
        >
          Apply
        </PrimaryButton>
        <SecondaryButtonLink
          href={pathname}
          onClick={reset}
          className="flex-1 lg:flex-none"
        >
          Reset
        </SecondaryButtonLink>
      </div>
    </Form>
  );
}

function createMovieFiltersHref(
  pathname: string,
  formData: FormData,
): string {
  const searchParams = new URLSearchParams();
  const search = readFormString(formData, "search").trim();
  const genre = readFormString(formData, "genre");
  const release = readFormString(formData, "release");
  const sort = readFormString(formData, "sort");

  if (search) {
    searchParams.set("search", search);
  }

  if (genre) {
    searchParams.set("genre", genre);
  }

  if (release && release !== "all") {
    searchParams.set("release", release);
  }

  if (sort && sort !== "releaseAsc") {
    searchParams.set("sort", sort);
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
