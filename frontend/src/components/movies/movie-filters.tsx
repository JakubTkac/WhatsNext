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

const fieldClassName = "dense-field";

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
      className="mt-4 grid gap-2 min-[36rem]:grid-cols-2 lg:grid-cols-[minmax(12rem,1.35fr)_1fr_1fr_1fr_auto] lg:items-end"
      aria-busy={navigation?.pending}
    >
      <label className="block min-[36rem]:col-span-2 lg:col-span-1">
        <span className="dense-label">Title</span>
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
        <span className="dense-label">Genre</span>
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
        <span className="dense-label">Release</span>
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
        <span className="dense-label">Sort</span>
        <select
          name="sort"
          defaultValue={query.sort}
          className={fieldClassName}
        >
          <option value="releaseAsc">Release date: earliest</option>
          <option value="releaseDesc">Release date: latest</option>
          <option value="titleAsc">Title: A-Z</option>
        </select>
      </label>

      <div className="flex gap-1.5 lg:col-span-1">
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
