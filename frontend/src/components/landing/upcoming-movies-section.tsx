import { getUpcomingMovies } from "@/lib/api";
import {
  SectionEmptyState,
  SectionErrorState,
} from "@/components/ui/section-state";
import { SecondaryButtonLink } from "@/components/ui/action-button";
import { UpcomingMovieCarousel } from "@/components/movies/upcoming-movie-carousel";

type UpcomingMoviesSectionProps = {
  search?: string;
};

export async function UpcomingMoviesSection({
  search,
}: UpcomingMoviesSectionProps) {
  const connection = await getUpcomingMovies(12, search);

  if (!connection.online) {
    return (
      <section
        className="mt-6 pb-10"
        aria-label="Upcoming releases error"
      >
        <SectionErrorState
          title="Upcoming releases are temporarily unavailable"
          description="We could not load the movie catalogue. Please try again."
        />
      </section>
    );
  }

  if (connection.movies.length === 0) {
    return (
      <section
        className="mt-6 pb-10"
        aria-label="Upcoming releases empty"
      >
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

  return (
    <section
      className="mt-6 pb-10"
      aria-labelledby="upcoming-heading"
    >
      <div className="flex items-end justify-between gap-3">
        <div className="max-w-4xl">
          <h1
            id="upcoming-heading"
            className="text-3xl font-semibold tracking-[-0.055em] sm:text-4xl lg:text-5xl"
          >
            Find out What's Next
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted sm:text-base">
            Discover movies that are coming to theaters soon and keep them
            close
          </p>
        </div>

        {search ? null : (
          <SecondaryButtonLink href="/movies" className="shrink-0">
            Browse all
          </SecondaryButtonLink>
        )}
      </div>

      <UpcomingMovieCarousel
        movies={connection.movies}
        extendedDescription
        seamless
      />
    </section>
  );
}
