import { MovieDetailHeroSkeleton } from "@/components/movies/movie-detail-hero";
import { ReviewCardsSkeleton } from "@/components/reviews/review-card";

export default function Loading() {
  return (
    <main
      className="page-shell"
      aria-busy="true"
      aria-label="Loading movie details"
    >
      <span className="sr-only">Loading movie details</span>

      <MovieDetailHeroSkeleton />

      <section
        className="mt-6 border-y border-border py-3 sm:mt-8"
        aria-hidden="true"
      >
        <div className="skeleton-surface h-6 w-52 max-w-full rounded-lg" />
        <div className="skeleton-surface mt-2 h-3 w-full max-w-2xl rounded-full" />
        <div className="mt-3 flex justify-end">
          <div className="skeleton-surface h-8 w-28 rounded-lg" />
        </div>
      </section>

      <section className="mt-6 sm:mt-8" aria-hidden="true">
        <div className="flex items-baseline justify-between gap-4">
          <div className="skeleton-surface h-8 w-36 rounded-lg" />
          <div className="skeleton-surface h-4 w-20 rounded-full" />
        </div>
        <ReviewCardsSkeleton />
      </section>
    </main>
  );
}
