import { notFound } from "next/navigation";
import { MovieDetailHero } from "@/components/movies/movie-detail-hero";
import { RecentlyViewedMovies } from "@/components/movies/recently-viewed-movies";
import { RecentlyViewedMovieTracker } from "@/components/movies/recently-viewed-movie-tracker";
import { MovieReviewAction } from "@/components/movies/movie-review-action";
import { MovieWatchlistAction } from "@/components/movies/movie-watchlist-action";
import { ReviewCard } from "@/components/reviews/review-card";
import { PageErrorState } from "@/components/ui/page-error-state";
import {
  getMovieDetails,
  getMovieReviewWorkspace,
  type LatestReview,
  type MovieDetails,
  type MovieReviewWorkspaceConnection,
} from "@/lib/api";
import {
  getMovieWatchlist,
  type MovieWatchlistConnection,
} from "@/lib/watchlist";

const releaseDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

type MoviePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MoviePage({ params }: MoviePageProps) {
  const slug = normalizeSlug((await params).slug);

  if (!slug) {
    notFound();
  }

  const [movieConnection, reviewWorkspace, watchlistConnection] =
    await Promise.all([
      getMovieDetails(slug),
      getMovieReviewWorkspace(slug),
      getMovieWatchlist(),
    ]);

  if (movieConnection.status === "not-found") {
    notFound();
  }

  if (movieConnection.status === "unavailable") {
    return (
      <PageErrorState
        title="Movie unavailable"
        description="We could not load this movie right now. Please try again."
      />
    );
  }

  const movie = movieConnection.movie;
  const returnTo = `/movies/${movie.slug}`;

  return (
    <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <RecentlyViewedMovieTracker
        movie={{
          slug: movie.slug,
          title: movie.title,
          posterUrl: movie.posterUrl,
        }}
      />

      <MovieDetailHero movie={movie}>
        <MovieWatchlistAction
          {...getWatchlistActionProps(
            watchlistConnection,
            movie.slug,
            returnTo,
          )}
        />
      </MovieDetailHero>

      <section
        className="mt-16 border-y border-border py-8 sm:mt-20 sm:py-10"
        aria-labelledby="write-review-heading"
      >
        <div>
          <h2
            id="write-review-heading"
            className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
          >
            Review this movie
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Reviews are available after release. Saving the movie to your
            watchlist is optional.
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <MovieReviewAction
            {...getReviewActionProps(movie, reviewWorkspace, returnTo)}
          />
        </div>
      </section>

      <MovieReviews movie={movie} />
      <RecentlyViewedMovies className="mt-20" />
    </main>
  );
}

function MovieReviews({ movie }: { movie: MovieDetails }) {
  return (
    <section className="mt-16 sm:mt-20" aria-labelledby="movie-reviews-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="movie-reviews-heading"
          className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl"
        >
          Reviews
        </h2>
        <p className="text-sm text-muted">
          {movie.reviewCount}{" "}
          {movie.reviewCount === 1 ? "review" : "reviews"}
        </p>
      </div>

      {movie.reviews.length === 0 ? (
        <div className="mt-8 border-y border-border py-8">
          <p className="text-sm leading-6 text-muted">
            No reviews yet. Be the first to share your thoughts after release.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {movie.reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={{
                ...review,
                movie: {
                  slug: movie.slug,
                  title: movie.title,
                  posterUrl: movie.posterUrl,
                },
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function getWatchlistActionProps(
  connection: MovieWatchlistConnection,
  movieSlug: string,
  returnTo: string,
):
  | {
      state: "available";
      movieSlug: string;
      returnTo: string;
      initiallySaved: boolean;
    }
  | { state: "unauthenticated"; returnTo: string }
  | { state: "unavailable" } {
  if (connection.status === "online") {
    return {
      state: "available",
      movieSlug,
      returnTo,
      initiallySaved: connection.movieSlugs.includes(movieSlug),
    };
  }

  if (connection.status === "unauthenticated") {
    return { state: "unauthenticated", returnTo };
  }

  return { state: "unavailable" };
}

function getReviewActionProps(
  movie: MovieDetails,
  workspace: MovieReviewWorkspaceConnection,
  returnTo: string,
):
  | { state: "unreleased"; releaseLabel: string }
  | { state: "unauthenticated"; returnTo: string }
  | { state: "unavailable" }
  | { state: "reviewed"; review: LatestReview }
  | { state: "available"; movieSlug: string } {
  if (movie.releaseDate > currentDate()) {
    return {
      state: "unreleased",
      releaseLabel: releaseDateFormatter.format(toUtcDate(movie.releaseDate)),
    };
  }

  if (workspace.status === "unauthenticated") {
    return { state: "unauthenticated", returnTo };
  }

  if (workspace.status === "unavailable") {
    return { state: "unavailable" };
  }

  return workspace.review
    ? { state: "reviewed", review: workspace.review }
    : { state: "available", movieSlug: movie.slug };
}

function normalizeSlug(value: string): string {
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)
    ? normalized
    : "";
}

function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function toUtcDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}
