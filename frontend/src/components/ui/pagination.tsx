"use client";

import {
  GhostButtonLink,
  SecondaryButtonLink,
} from "@/components/ui/action-button";
import { useListingNavigation } from "@/components/ui/listing-navigation";
import type { MouseEvent } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pathname: string;
  query: Record<string, string | number | undefined>;
  pageParameter?: string;
  hash?: string;
  pending?: boolean;
  onNavigate?: (href: string) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  pathname,
  query,
  pageParameter = "page",
  hash,
  pending = false,
  onNavigate,
}: PaginationProps) {
  const listingNavigation = useListingNavigation();

  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(currentPage, totalPages);
  const navigationPending = pending || listingNavigation?.pending === true;
  const navigate = onNavigate ?? listingNavigation?.navigate;

  return (
    <nav
      className={`mt-10 flex flex-wrap items-center justify-center gap-2 transition-opacity ${
        navigationPending ? "pointer-events-none opacity-60" : ""
      }`}
      aria-label="Pagination"
      aria-busy={navigationPending}
    >
      {currentPage > 1 ? (
        <SecondaryButtonLink
          href={createPageHref(
            pathname,
            query,
            currentPage - 1,
            pageParameter,
            hash,
          )}
          onClick={createNavigationHandler(navigate)}
          rel="prev"
        >
          Previous
        </SecondaryButtonLink>
      ) : (
        <span
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-subtle opacity-60"
          aria-disabled="true"
        >
          Previous
        </span>
      )}

      {pages.map((page, index) =>
        page === null ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex min-h-11 min-w-8 items-center justify-center text-subtle"
            aria-hidden="true"
          >
            &hellip;
          </span>
        ) : page === currentPage ? (
          <span
            key={page}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-primary px-3 text-sm font-semibold text-white"
            aria-current="page"
          >
            {page}
          </span>
        ) : (
          <GhostButtonLink
            key={page}
            href={createPageHref(
              pathname,
              query,
              page,
              pageParameter,
              hash,
            )}
            onClick={createNavigationHandler(navigate)}
            className="min-w-11 px-3"
          >
            {page}
          </GhostButtonLink>
        ),
      )}

      {currentPage < totalPages ? (
        <SecondaryButtonLink
          href={createPageHref(
            pathname,
            query,
            currentPage + 1,
            pageParameter,
            hash,
          )}
          onClick={createNavigationHandler(navigate)}
          rel="next"
        >
          Next
        </SecondaryButtonLink>
      ) : (
        <span
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-subtle opacity-60"
          aria-disabled="true"
        >
          Next
        </span>
      )}
    </nav>
  );
}

function createNavigationHandler(
  onNavigate?: (href: string) => void,
): ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined {
  if (!onNavigate) {
    return undefined;
  }

  return (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.currentTarget.target === "_blank"
    ) {
      return;
    }

    event.preventDefault();
    const href = event.currentTarget.getAttribute("href");

    if (href) {
      onNavigate(href);
    }
  };
}

function createPageHref(
  pathname: string,
  query: Record<string, string | number | undefined>,
  page: number,
  pageParameter = "page",
  hash?: string,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  if (page > 1) {
    searchParams.set(pageParameter, String(page));
  } else {
    searchParams.delete(pageParameter);
  }

  const search = searchParams.toString();
  const suffix = hash ? `#${hash.replace(/^#/, "")}` : "";
  return search ? `${pathname}?${search}${suffix}` : `${pathname}${suffix}`;
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): Array<number | null> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pageSet = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sortedPages = [...pageSet]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
  const pages: Array<number | null> = [];

  for (const page of sortedPages) {
    const previousPage = pages.at(-1);

    if (typeof previousPage === "number" && page - previousPage > 1) {
      pages.push(null);
    }

    pages.push(page);
  }

  return pages;
}
