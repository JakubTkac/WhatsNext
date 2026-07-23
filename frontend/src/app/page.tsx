import type { Metadata } from "next";
import { Suspense } from "react";
import { LatestReviewsSection } from "@/components/landing/latest-reviews-section";
import { LatestReviewsSkeleton } from "@/components/landing/latest-reviews-skeleton";
import { UpcomingMoviesSection } from "@/components/landing/upcoming-movies-section";
import { UpcomingMoviesSkeleton } from "@/components/landing/upcoming-movies-skeleton";
import { RecentlyViewedMovies } from "@/components/movies/recently-viewed-movies";
import { JsonLd } from "@/components/seo/json-ld";
import {
  createPublicPageMetadata,
  createWebsiteJsonLd,
} from "@/lib/seo";

const homeMetadata = createPublicPageMetadata({
  title: "Discover Upcoming Movies",
  description:
    "Discover upcoming movie releases, browse community reviews, and save films to your personal WhatsNext watchlist.",
  path: "/",
});

export const metadata: Metadata = {
  ...homeMetadata,
  title: {
    absolute: "WhatsNext — Discover Upcoming Movies",
  },
};

type HomeProps = {
  searchParams: Promise<{ search?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const search = normalizeSearch(params.search);

  return (
    <main className="mx-auto w-full max-w-[92rem] flex-1 px-2 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
      <JsonLd data={createWebsiteJsonLd()} />

      <Suspense
        key={search}
        fallback={<UpcomingMoviesSkeleton />}
      >
        <UpcomingMoviesSection search={search} />
      </Suspense>

      {search ? null : (
        <>
          <Suspense fallback={<LatestReviewsSkeleton />}>
            <LatestReviewsSection />
          </Suspense>
          <RecentlyViewedMovies className="mt-8 pb-10" />
        </>
      )}
    </main>
  );
}

function normalizeSearch(search: string | string[] | undefined): string {
  if (typeof search !== "string") {
    return "";
  }

  return search.trim().slice(0, 80);
}
