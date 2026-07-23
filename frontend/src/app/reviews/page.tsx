import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewCard } from "@/components/reviews/review-card";
import { PublicReviewFilters } from "@/components/reviews/review-filters";
import { ReviewListingResults } from "@/components/reviews/review-listing-results";
import { ReviewManager } from "@/components/reviews/review-manager";
import {
  OwnedReviewsSkeleton,
  ReviewResultsBlockSkeleton,
} from "@/components/reviews/reviews-page-skeleton";
import { PageErrorState } from "@/components/ui/page-error-state";
import { ListingNavigationProvider } from "@/components/ui/listing-navigation";
import { SectionEmptyState } from "@/components/ui/section-state";
import {
  getReviewsPage,
  getReviewWorkspace,
  type ReviewsQuery,
} from "@/lib/api";

export const metadata: Metadata = {
  title: "Movie Reviews",
  description:
    "Browse recent movie ratings and reviews from the WhatsNext community.",
};

type ReviewsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  const params = await searchParams;
  const query = parsePublicReviewsQuery(params);
  const ownedQuery = parseOwnedReviewsQuery(params);
  const editReviewId = readOptionalString(params.edit, 64);

  return (
    <main className="mx-auto w-full max-w-[92rem] flex-1 px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <div className="max-w-3xl">
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">
          Movie reviews
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Browse what the community has watched and rated recently.
        </p>
      </div>

      <ListingNavigationProvider>
        <PublicReviewFilters
          key={`${query.movie ?? ""}-${query.rating ?? ""}`}
          query={query}
          preservedQuery={createOwnedReviewQueryParams(ownedQuery)}
        />

        <Suspense fallback={<ReviewResultsBlockSkeleton />}>
          <PublicReviewResults
            query={query}
            ownedQuery={ownedQuery}
          />
        </Suspense>
      </ListingNavigationProvider>

      <ListingNavigationProvider>
        <Suspense
          key={`${ownedQuery.page}-${ownedQuery.movie ?? ""}-${ownedQuery.rating ?? ""}-${editReviewId ?? "reviews"}`}
          fallback={<OwnedReviewsSkeleton />}
        >
          <OwnedReviewWorkspace
            publicQuery={query}
            query={ownedQuery}
            editReviewId={editReviewId}
          />
        </Suspense>
      </ListingNavigationProvider>
    </main>
  );
}

async function PublicReviewResults({
  query,
  ownedQuery,
}: {
  query: ReviewsQuery;
  ownedQuery: ReviewsQuery;
}) {
  const connection = await getReviewsPage(query);

  if (!connection.online) {
    return (
      <PageErrorState
        title="Reviews unavailable"
        description="We could not load community reviews. Please try again."
      />
    );
  }

  return (
    <ReviewListingResults
      currentPage={connection.meta.page}
      totalItems={connection.meta.totalItems}
      totalPages={connection.meta.totalPages}
      pageSize={connection.meta.limit}
      query={{
        movie: query.movie,
        rating: query.rating,
        ...createOwnedReviewQueryParams(ownedQuery),
      }}
    >
      {connection.reviews.length === 0 ? (
        <div className="mt-6">
          <SectionEmptyState
            title="No reviews match these filters"
            description="Adjust the movie title or rating and try again."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {connection.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </ReviewListingResults>
  );
}

async function OwnedReviewWorkspace({
  publicQuery,
  query,
  editReviewId,
}: {
  publicQuery: ReviewsQuery;
  query: ReviewsQuery;
  editReviewId?: string;
}) {
  const workspace = await getReviewWorkspace(query);

  return (
    <ReviewManager
      key={`${query.page}-${query.movie ?? ""}-${query.rating ?? ""}-${editReviewId ?? "reviews"}`}
      connection={workspace}
      query={query}
      initialEditReviewId={editReviewId}
      preservedQuery={{
        page: publicQuery.page > 1 ? publicQuery.page : undefined,
        movie: publicQuery.movie,
        rating: publicQuery.rating,
      }}
    />
  );
}

function parsePublicReviewsQuery(
  params: Record<string, string | string[] | undefined>,
): ReviewsQuery {
  return {
    page: readPositiveInteger(params.page),
    movie: readOptionalString(params.movie, 80),
    rating: readRating(params.rating),
  };
}

function parseOwnedReviewsQuery(
  params: Record<string, string | string[] | undefined>,
): ReviewsQuery {
  return {
    page: readPositiveInteger(params.myPage),
    movie: readOptionalString(params.myMovie, 80),
    rating: readRating(params.myRating),
  };
}

function createOwnedReviewQueryParams(
  query: ReviewsQuery,
): Record<string, string | number | undefined> {
  return {
    myPage: query.page > 1 ? query.page : undefined,
    myMovie: query.movie,
    myRating: query.rating,
  };
}

function readRating(
  value: string | string[] | undefined,
): number | undefined {
  const rating = Number(readString(value));
  return Number.isInteger(rating) && rating >= 1 && rating <= 10
    ? rating
    : undefined;
}

function readPositiveInteger(value: string | string[] | undefined): number {
  const parsed = Number(readString(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function readOptionalString(
  value: string | string[] | undefined,
  maximumLength: number,
): string | undefined {
  const normalized = readString(value).trim().slice(0, maximumLength);
  return normalized || undefined;
}

function readString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
