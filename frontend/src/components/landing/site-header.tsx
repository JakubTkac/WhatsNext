import { Suspense } from "react";
import Link from "next/link";
import {
  AccountNavigation,
  AccountNavigationSkeleton,
} from "@/components/auth/account-navigation";
import { SiteNavigation } from "@/components/landing/site-navigation";
import { SearchForm } from "@/components/ui/search-form";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-[92rem] grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 px-2 py-1.5 sm:grid-cols-[auto_minmax(12rem,1fr)_auto] sm:px-4 lg:grid-cols-[auto_auto_minmax(16rem,34rem)_auto] lg:gap-x-5 lg:px-6">
        <Link
          href="/"
          className="order-1 w-fit text-lg font-bold tracking-[-0.05em] text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary sm:text-xl"
          aria-label="WhatsNext home"
        >
          Whats<span className="text-primary">Next</span>
        </Link>

        <div className="order-3 col-span-2 sm:order-2 sm:col-span-1 lg:order-3">
          <Suspense fallback={<SearchFormFallback />}>
            <SearchForm />
          </Suspense>
        </div>

        <div className="order-2 justify-self-end sm:order-3 lg:order-4">
          <Suspense fallback={<AccountNavigationSkeleton />}>
            <AccountNavigation />
          </Suspense>
        </div>

        <div className="order-4 col-span-2 -mx-2 sm:col-span-3 sm:-mx-4 lg:order-2 lg:col-span-1 lg:mx-0">
          <SiteNavigation />
        </div>
      </div>
    </header>
  );
}

function SearchFormFallback() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-9 min-w-0 items-center justify-between overflow-hidden rounded-lg bg-secondary p-0.5 sm:min-h-10"
    >
      <span className="px-2.5 text-xs text-subtle sm:text-sm">
        Search all movies
      </span>
      <span className="inline-flex min-h-8 items-center rounded-md bg-primary px-3 text-xs font-semibold text-white sm:min-h-9 sm:text-sm">
        Search
      </span>
    </div>
  );
}
