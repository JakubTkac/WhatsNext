"use client";

import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { PrimaryButton } from "@/components/ui/action-button";

export function SearchForm() {
  const searchParams = useSearchParams();
  const search = normalizeSearch(searchParams.get("search"));

  return (
    <Form
      key={search}
      action="/"
      role="search"
      className="flex min-w-0 overflow-hidden rounded-xl border border-transparent bg-secondary p-1 transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
    >
      <label className="sr-only" htmlFor="site-search">
        Search upcoming movies
      </label>
      <input
        id="site-search"
        name="search"
        type="search"
        defaultValue={search}
        maxLength={80}
        placeholder="Search upcoming movies"
        className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-subtle sm:px-4"
      />
      <PrimaryButton type="submit">Search</PrimaryButton>
    </Form>
  );
}

function normalizeSearch(search: string | null): string {
  return search?.trim().slice(0, 80) ?? "";
}
