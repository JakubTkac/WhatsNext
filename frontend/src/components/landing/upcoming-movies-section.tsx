import { getUpcomingMovies } from "@/lib/api";
import {
  SectionEmptyState,
  SectionErrorState,
} from "@/components/ui/section-state";
import { FeaturedMovie } from "./featured-movie";
import { UpcomingMovieCarousel } from "./movie-carousel";

type UpcomingMoviesSectionProps = {
  search?: string;
};

export async function UpcomingMoviesSection({
  search,
}: UpcomingMoviesSectionProps) {
  const connection = await getUpcomingMovies(12, search);

  if (!connection.online) {
    return (
      <section className="mt-14 sm:mt-16" aria-label="Upcoming releases error">
        <SectionErrorState
          title="Upcoming releases are temporarily unavailable"
          description="We could not load the movie catalogue. Please try again."
        />
      </section>
    );
  }

  if (connection.movies.length === 0) {
    return (
      <section className="mt-14 sm:mt-16" aria-label="Upcoming releases empty">
        <SectionEmptyState
          title={search ? "No matching upcoming movies" : "No upcoming movies"}
          description={
            search
              ? "Try a different title."
              : "New releases will appear here when they are added."
          }
        />
      </section>
    );
  }

  const nextRelease = connection.movies.at(0);

  return (
    <>
      {search || !nextRelease ? null : <FeaturedMovie movie={nextRelease} />}

      <section className="mt-14 sm:mt-16" aria-labelledby="upcoming-heading">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Release calendar
            </p>
            <h2
              id="upcoming-heading"
              className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl"
            >
              {search ? `Results for "${search}"` : "Upcoming releases"}
            </h2>
          </div>

          {search ? null : (
            <span
              className="inline-flex shrink-0 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm"
              title="The movie catalogue will be implemented later"
            >
              Browse all
              <span className="ml-2 text-primary" aria-hidden="true">
                &rarr;
              </span>
            </span>
          )}
        </div>

        <UpcomingMovieCarousel movies={connection.movies} />
      </section>
    </>
  );
}
