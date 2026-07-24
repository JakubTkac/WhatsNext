import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewCard } from "@/components/reviews/review-card";
import { PublicReviewFilters } from "@/components/reviews/review-filters";
import { ReviewListingResults } from "@/components/reviews/review-listing-results";
import { ReviewManager } from "@/components/reviews/review-manager";
import { ReviewsPageSkeleton } from "@/components/reviews/reviews-page-skeleton";
import { PageErrorState } from "@/components/ui/page-error-state";
import { ListingNavigationProvider } from "@/components/ui/listing-navigation";
import { SectionEmptyState } from "@/components/ui/section-state";
import {
  getReviewsPage,
  getReviewWorkspace,
  type ReviewsQuery,
} from "@/lib/api";
import { createPublicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Movie Reviews",
  description:
    "Browse recent movie ratings and reviews from the WhatsNext community.",
  path: "/reviews",
});

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
    <Suspense fallback={<ReviewsPageSkeleton />}>
      <ReviewsListing
        query={query}
        ownedQuery={ownedQuery}
        editReviewId={editReviewId}
      />
    </Suspense>
  );
}

async function ReviewsListing({
  query,
  ownedQuery,
  editReviewId,
}: {
  query: ReviewsQuery;
  ownedQuery: ReviewsQuery;
  editReviewId?: string;
}) {
  const [connection, workspace] = await Promise.all([
    getReviewsPage(query),
    getReviewWorkspace(ownedQuery),
  ]);

  if (!connection.online) {
    return (
      <PageErrorState
        title="Reviews unavailable"
        description="We could not load community reviews. Please try again."
      />
    );
  }

  return (
    <main className="page-shell">
      <div className="max-w-3xl">
        <h1 className="page-title">
          Movie reviews
        </h1>
        <p className="page-lede">
          Browse what the community has watched and rated recently.
        </p>
      </div>

      <ListingNavigationProvider>
        <PublicReviewFilters
          key={`${query.movie ?? ""}-${query.rating ?? ""}`}
          query={query}
          preservedQuery={createOwnedReviewQueryParams(ownedQuery)}
        />

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
            <div className="mt-3">
              <SectionEmptyState
                title="No reviews match these filters"
                description="Adjust the movie title or rating and try again."
              />
            </div>
          ) : (
            <div className="mt-3 grid gap-2.5 min-[36rem]:grid-cols-2 xl:grid-cols-4">
              {connection.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </ReviewListingResults>
      </ListingNavigationProvider>

      <ListingNavigationProvider>
        <ReviewManager
          key={`${ownedQuery.page}-${ownedQuery.movie ?? ""}-${ownedQuery.rating ?? ""}-${editReviewId ?? "reviews"}`}
          connection={workspace}
          query={ownedQuery}
          initialEditReviewId={editReviewId}
          preservedQuery={{
            page: query.page > 1 ? query.page : undefined,
            movie: query.movie,
            rating: query.rating,
          }}
        />
      </ListingNavigationProvider>
    </main>
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
