import { MovieGridCardSkeleton } from "@/components/movies/movie-grid-card";

const defaultMovieSkeletonCount = 12;
const filterSkeletons = [
  { labelWidth: "w-10", fieldWidth: "lg:min-w-72" },
  { labelWidth: "w-12", fieldWidth: "" },
  { labelWidth: "w-14", fieldWidth: "" },
  { labelWidth: "w-10", fieldWidth: "" },
];

export function MovieListingPageSkeleton() {
  return (
    <main
      className="page-shell"
      aria-busy="true"
      aria-label="Loading movies"
    >
      <span className="sr-only">Loading movies</span>

      <div
        className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end"
        aria-hidden="true"
      >
        <div className="w-full max-w-3xl">
          <div className="skeleton-surface h-8 w-64 max-w-full rounded-lg sm:h-9 lg:h-12" />
          <div className="skeleton-surface mt-2 h-3 w-full max-w-2xl rounded-full" />
        </div>
        <div className="skeleton-surface h-4 w-20 rounded-full" />
      </div>

      <MovieFiltersSkeleton />

      <MovieResultsSummarySkeleton />
      <MovieResultsSkeleton />
    </main>
  );
}

export function MovieResultsSkeleton({
  itemCount = defaultMovieSkeletonCount,
}: {
  itemCount?: number;
}) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading movie results"
    >
      <span className="sr-only">Loading movie results</span>
      <div
        className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3"
        aria-hidden="true"
      >
        {Array.from({ length: itemCount }, (_, index) => (
          <MovieGridCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function MovieResultsSummarySkeleton() {
  return (
    <div
      className="mt-4 flex items-center justify-between gap-3"
      aria-hidden="true"
    >
      <div className="skeleton-surface h-4 w-20 rounded-full" />
      <div className="skeleton-surface h-4 w-24 rounded-full" />
    </div>
  );
}

function MovieFiltersSkeleton() {
  return (
    <div
      className="mt-4 grid gap-2 min-[36rem]:grid-cols-2 lg:grid-cols-[minmax(12rem,1.35fr)_1fr_1fr_1fr_auto] lg:items-end"
      aria-hidden="true"
    >
      {filterSkeletons.map((filter, index) => (
        <div
          key={index}
          className={`${filter.fieldWidth} ${index === 0 ? "min-[36rem]:col-span-2 lg:col-span-1" : ""}`}
        >
          <div
            className={`skeleton-surface mb-1 h-3 rounded-full ${filter.labelWidth}`}
          />
          <div className="skeleton-surface h-9 w-full rounded-lg" />
        </div>
      ))}

      <div className="flex gap-1.5">
        <div className="skeleton-surface h-8 w-16 flex-1 rounded-lg lg:flex-none" />
        <div className="skeleton-surface h-8 w-16 flex-1 rounded-lg lg:flex-none" />
      </div>
    </div>
  );
}
