import { MovieDetailHeroSkeleton } from "@/components/movies/movie-detail-hero";
import { ReviewCardsSkeleton } from "@/components/reviews/review-card";

export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16"
      aria-busy="true"
      aria-label="Loading movie details"
    >
      <span className="sr-only">Loading movie details</span>

      <MovieDetailHeroSkeleton />

      <section
        className="mt-16 border-y border-border py-8 sm:mt-20 sm:py-10"
        aria-hidden="true"
      >
        <div className="skeleton-surface h-9 w-64 max-w-full rounded-xl" />
        <div className="skeleton-surface mt-3 h-4 w-full max-w-2xl rounded-full" />
        <div className="skeleton-surface mt-3 h-4 w-3/5 max-w-lg rounded-full" />
        <div className="mt-6 flex justify-end">
          <div className="skeleton-surface h-11 w-36 rounded-xl" />
        </div>
      </section>

      <section className="mt-16 sm:mt-20" aria-hidden="true">
        <div className="flex items-baseline justify-between gap-4">
          <div className="skeleton-surface h-10 w-40 rounded-xl" />
          <div className="skeleton-surface h-4 w-20 rounded-full" />
        </div>
        <ReviewCardsSkeleton />
      </section>
    </main>
  );
}
