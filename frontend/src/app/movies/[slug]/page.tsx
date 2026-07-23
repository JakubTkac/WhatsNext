import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MovieDetailHero } from "@/components/movies/movie-detail-hero";
import { RecentlyViewedMovies } from "@/components/movies/recently-viewed-movies";
import { RecentlyViewedMovieTracker } from "@/components/movies/recently-viewed-movie-tracker";
import { MovieReviewAction } from "@/components/movies/movie-review-action";
import { MovieWatchlistAction } from "@/components/movies/movie-watchlist-action";
import { ReviewCard } from "@/components/reviews/review-card";
import { JsonLd } from "@/components/seo/json-ld";
import { PageErrorState } from "@/components/ui/page-error-state";
import {
  getMovieDetails,
  getMovieReviewWorkspace,
  type LatestReview,
  type MovieDetails,
  type MovieReviewWorkspaceConnection,
} from "@/lib/api";
import {
  absoluteUrl,
  createMissingPageMetadata,
  createPublicPageMetadata,
  shortenSeoDescription,
} from "@/lib/seo";
import {
  getMovieWatchlist,
  type MovieWatchlistConnection,
} from "@/lib/watchlist";

const getMoviePageData = cache(getMovieDetails);

const releaseDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

type MoviePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const slug = normalizeSlug((await params).slug);

  if (!slug) {
    notFound();
  }

  const connection = await getMoviePageData(slug);

  if (connection.status === "not-found") {
    notFound();
  }

  if (connection.status === "unavailable") {
    return createMissingPageMetadata({
      title: "Movie Unavailable",
      description: "This movie could not be loaded from WhatsNext right now.",
      path: `/movies/${slug}`,
    });
  }

  const { movie } = connection;
  const description = shortenSeoDescription(movie.description);

  return createPublicPageMetadata({
    title: movie.title,
    description,
    path: `/movies/${movie.slug}`,
    images: movie.posterUrl
      ? [
          {
            url: movie.posterUrl,
            width: 500,
            height: 750,
            alt: `${movie.title} poster`,
          },
        ]
      : undefined,
  });
}

export default async function MoviePage({ params }: MoviePageProps) {
  const slug = normalizeSlug((await params).slug);

  if (!slug) {
    notFound();
  }

  const [movieConnection, reviewWorkspace, watchlistConnection] =
    await Promise.all([
      getMoviePageData(slug),
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
    <main className="page-shell">
      <JsonLd data={createMovieJsonLd(movie)} />

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
        className="mt-6 border-y border-border py-3 sm:mt-8"
        aria-labelledby="write-review-heading"
      >
        <div>
          <h2
            id="write-review-heading"
            className="text-xl font-semibold tracking-[-0.035em] sm:text-2xl"
          >
            Review this movie
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            Reviews are available after release. Saving the movie to your
            watchlist is optional.
          </p>
        </div>
        <div className="mt-2 flex min-w-0 justify-end">
          <MovieReviewAction
            {...getReviewActionProps(movie, reviewWorkspace, returnTo)}
          />
        </div>
      </section>

      <MovieReviews movie={movie} />
      <RecentlyViewedMovies className="mt-8" />
    </main>
  );
}

function MovieReviews({ movie }: { movie: MovieDetails }) {
  return (
    <section className="mt-6 sm:mt-8" aria-labelledby="movie-reviews-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="movie-reviews-heading"
          className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl"
        >
          Reviews
        </h2>
        <p className="text-sm text-muted">
          {movie.reviewCount}{" "}
          {movie.reviewCount === 1 ? "review" : "reviews"}
        </p>
      </div>

      {movie.reviews.length === 0 ? (
        <div className="mt-3 border-y border-border py-3">
          <p className="text-xs leading-5 text-muted">
            No reviews yet. Be the first to share your thoughts after release.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid gap-2.5 min-[36rem]:grid-cols-2 xl:grid-cols-4">
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

function createMovieJsonLd(movie: MovieDetails): Record<string, unknown> {
  const movieUrl = absoluteUrl(`/movies/${movie.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: shortenSeoDescription(movie.description),
    url: movieUrl,
    mainEntityOfPage: movieUrl,
    image: movie.posterUrl ?? undefined,
    datePublished: movie.releaseDate,
    duration: movie.runtimeMinutes
      ? `PT${movie.runtimeMinutes}M`
      : undefined,
    genre: movie.genres.map((genre) => genre.name),
    aggregateRating:
      movie.averageRating !== null && movie.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: movie.averageRating,
            bestRating: 10,
            worstRating: 1,
            ratingCount: movie.reviewCount,
          }
        : undefined,
    review: movie.reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author.displayName,
      },
      datePublished: review.createdAt,
      reviewBody: review.body,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 10,
        worstRating: 1,
      },
    })),
  };
}
