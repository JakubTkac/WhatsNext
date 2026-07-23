import { Suspense } from "react";
import Link from "next/link";
import {
  AccountNavigation,
  AccountNavigationSkeleton,
} from "@/components/auth/account-navigation";
import { SearchForm } from "@/components/ui/search-form";

type SiteHeaderProps = {
  search?: string;
};

export function SiteHeader({ search = "" }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto grid min-h-20 w-full max-w-[92rem] grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-8 md:grid-cols-[auto_minmax(20rem,42rem)_auto] md:justify-between lg:px-12">
        <Link
          href="/"
          className="w-fit text-xl font-bold tracking-[-0.05em] text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-2xl"
          aria-label="WhatsNext home"
        >
          Whats<span className="text-primary">Next</span>
        </Link>

        <div className="order-3 col-span-2 md:order-none md:col-span-1">
          <SearchForm defaultValue={search} />
        </div>

        <div className="justify-self-end">
          <Suspense fallback={<AccountNavigationSkeleton />}>
            <AccountNavigation />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
