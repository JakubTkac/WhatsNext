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
      className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16"
      aria-busy="true"
      aria-label="Loading movies"
    >
      <span className="sr-only">Loading movies</span>

      <div
        className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end"
        aria-hidden="true"
      >
        <div className="w-full max-w-3xl">
          <div className="skeleton-surface h-14 w-80 max-w-full rounded-xl sm:h-16" />
          <div className="skeleton-surface mt-5 h-5 w-full max-w-2xl rounded-full" />
          <div className="skeleton-surface mt-3 h-5 w-3/5 max-w-lg rounded-full" />
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
        className="mt-6 grid gap-5 lg:grid-cols-2"
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
      className="mt-8 flex items-center justify-between gap-4"
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
      className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.4fr)_1fr_1fr_1fr_auto] lg:items-end"
      aria-hidden="true"
    >
      {filterSkeletons.map((filter, index) => (
        <div key={index} className={filter.fieldWidth}>
          <div
            className={`skeleton-surface mb-2 h-4 rounded-full ${filter.labelWidth}`}
          />
          <div className="skeleton-surface h-11 w-full rounded-xl" />
        </div>
      ))}

      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <div className="skeleton-surface h-11 w-20 flex-1 rounded-xl lg:flex-none" />
        <div className="skeleton-surface h-11 w-20 flex-1 rounded-xl lg:flex-none" />
      </div>
    </div>
  );
}
