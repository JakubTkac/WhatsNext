import { Suspense } from "react";
import { LatestReviewsSection } from "@/components/landing/latest-reviews-section";
import { LatestReviewsSkeleton } from "@/components/landing/latest-reviews-skeleton";
import { UpcomingMoviesSection } from "@/components/landing/upcoming-movies-section";
import { UpcomingMoviesSkeleton } from "@/components/landing/upcoming-movies-skeleton";
import { RecentlyViewedMovies } from "@/components/movies/recently-viewed-movies";

type HomeProps = {
  searchParams: Promise<{ search?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const search = normalizeSearch(params.search);

  return (
    <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <div className="max-w-3xl">
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">
          Find out What's Next
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Discover movies that are coming to theaters soon and keep them close
        </p>
      </div>

      <Suspense
        key={search}
        fallback={<UpcomingMoviesSkeleton showFeatured={!search} />}
      >
        <UpcomingMoviesSection search={search} />
      </Suspense>

      {search ? null : (
        <>
          <Suspense fallback={<LatestReviewsSkeleton />}>
            <LatestReviewsSection />
          </Suspense>
          <RecentlyViewedMovies className="mt-20" />
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
